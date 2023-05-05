import db from "../models/index";
import fs from "fs";
import appRoot from "app-root-path";
import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);
import { LANGUAGES, LIST_STATUS, UPDATED_STATUS, USER_ROLE } from "../constant";
import _ from "lodash";
import { isExistArrayAndNotEmpty } from "../condition";
require("dotenv").config();
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";

const bookingTable = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.restaurantId ||
        !data.customerId ||
        !data.date ||
        !data.timeType ||
        !data.table ||
        !data.timeString ||
        !data.language
      ) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let restaurant = await db.Restaurant.findOne({
        where: {
          id: data.restaurantId,
        },
      });
      if (!restaurant) {
        return resolve({
          errCode: 2,
          errMessage: "Không tìm thấy nhà hàng, vui lòng tải lại trang",
        });
      }

      let customer = await db.User.findOne({
        where: {
          id: data.customerId,
        },
      });
      if (!customer) {
        return resolve({
          errCode: 3,
          errMessage: "Không tìm thấy khách hàng, vui lòng đăng nhập lại",
        });
      }

      const isEmptyTable = await isStillHaveEmptyTable({
        restaurantId: restaurant.id,
        date: data.date,
        timeType: data.timeType,
        tableNewBooking: +data.table,
        restaurantTable: +restaurant.table,
      });
      if (!isEmptyTable) {
        return resolve({
          errCode: 4,
          errMessage: "Khung giờ này đã hết bàn, vui lòng chọn khung giờ khác",
        });
      }

      const token = uuidv4();
      let [newBooking, created] = await db.Booking.findOrCreate({
        where: {
          customerId: data.customerId,
          restaurantId: data.restaurantId,
          date: `${data.date}`,
          timeType: data.timeType,
        },
        defaults: {
          statusId: LIST_STATUS.NEW,
          customerId: customer.id,
          restaurantId: data.restaurantId,
          table: data.table,
          date: data.date,
          timeType: data.timeType,
          token: token,
        },
      });
      if (!created) {
        return resolve({
          errCode: 5,
          errMessage:
            "Bạn đã đặt bàn ở khung giờ này rồi, vui lòng chọn khung giờ khác",
        });
      }

      if (isExistArrayAndNotEmpty(data.listDishOrder)) {
        let listDishOrder = [];
        data.listDishOrder.map((item) => {
          let obj = {
            bookingId: newBooking.id,
            dishId: item.id,
          };
          listDishOrder.push(obj);
          return listDishOrder;
        });

        await db.DishOrder.bulkCreate(listDishOrder);
      }

      await emailService.sendEmailVerifyReservation({
        receiverEmail: customer.email,
        restaurantName:
          data.language === LANGUAGES.VI
            ? restaurant.nameVi
            : restaurant.nameEn,
        restaurantAddress:
          data.language === LANGUAGES.VI
            ? restaurant.addressVi
            : restaurant.addressEn,
        customerName:
          data.language === LANGUAGES.VI
            ? `${customer.lastName} ${customer.firstName}`
            : `${customer.firstName} ${customer.lastName}`,
        time: data.timeString,
        language: data.language,
        redirectLink: buildUrlEmailVerifyReservation(token),
      });

      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const buildUrlEmailVerifyReservation = (token) => {
  return `${process.env.URL_REACT}/verify-booking-table?token=${token}`;
};

const isStillHaveEmptyTable = async (data) => {
  let listExistBooking = await db.Booking.findAll({
    where: {
      restaurantId: data.restaurantId,
      date: `${data.date}`,
      timeType: data.timeType,
    },
  });

  if (isExistArrayAndNotEmpty(listExistBooking)) {
    let tableAlreadyBooked = 0;
    listExistBooking.map((item) => {
      tableAlreadyBooked += item.table;
      return tableAlreadyBooked;
    });
    let totalTableBooking = tableAlreadyBooked + data.tableNewBooking;
    if (totalTableBooking > data.restaurantTable) {
      return false;
    }
  }

  return true;
};

const checkExistBookByToken = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!token) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let existBook = await db.Booking.findOne({
        where: {
          token: token,
        },
      });

      if (!existBook) {
        return resolve({
          errCode: 2,
          errMessageVi: "Đơn đặt bàn không tồn tại",
          errMessageEn: "Table reservation does not exist",
        });
      }

      if (existBook.statusId !== LIST_STATUS.NEW) {
        return resolve({
          errCode: 3,
          errMessageVi: "Đơn đặt bàn đã được xác nhận trước đó",
          errMessageEn: "Pre-confirmed table reservation",
        });
      }

      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const verifyBookingTable = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!token) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let existBook = await db.Booking.findOne({
        where: {
          token: token,
        },
      });

      existBook.statusId = LIST_STATUS.VERIFIED;
      await existBook.save();

      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const forgotPassword = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.language) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let customer = await db.User.findOne({
        where: {
          email: data.email,
          roleId: USER_ROLE.CUSTOMER,
        },
      });
      if (!customer) {
        return resolve({
          errCode: 2,
          errMessage: "Không tìm thấy người dùng, vui lòng nhập email hợp lệ",
        });
      }

      const token = uuidv4();
      await createNewDetailForgot(customer.id, token);

      await emailService.sendEmailForgotPassword({
        receiverEmail: customer.email,
        customerName:
          data.language === LANGUAGES.VI
            ? `${customer.lastName} ${customer.firstName}`
            : `${customer.firstName} ${customer.lastName}`,
        language: data.language,
        redirectLink: buildUrlEmailUpdatePassword(customer.id, token),
      });

      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const buildUrlEmailUpdatePassword = (customerId, token) => {
  return `${process.env.URL_REACT}/update-password/${customerId}?token=${token}`;
};

const createNewDetailForgot = async (customerId, token) => {
  await db.DetailForgot.create({
    isUpdated: UPDATED_STATUS.FALSE,
    customerId: customerId,
    token: token,
  });
};

const updatePassword = (customerId, token, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!customerId || !token || !data.password) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let existDetailForgot = await db.DetailForgot.findOne({
        where: {
          customerId: customerId,
          token: token,
        },
      });
      if (!existDetailForgot) {
        return resolve({
          errCode: 2,
          errMessage:
            "Có lỗi xảy ra, vui lòng thực hiện yêu cầu cập nhật mật khẩu lại từ đầu",
        });
      }

      if (existDetailForgot.isUpdated === UPDATED_STATUS.TRUE) {
        return resolve({
          errCode: 2,
          errMessage: "Bạn chỉ có thể cập nhật mật khẩu 1 lần trên 1 yêu cầu",
        });
      }

      let customer = await db.User.findOne({
        where: {
          id: customerId,
        },
      });
      if (!customer) {
        return resolve({
          errCode: 3,
          errMessage: "Không tìm thấy người dùng",
        });
      }

      let passwordHash = await bcrypt.hashSync(data.password, salt);
      customer.password = passwordHash;
      await customer.save();

      existDetailForgot.isUpdated = UPDATED_STATUS.TRUE;
      await existDetailForgot.save();

      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

module.exports = {
  checkExistBookByToken,
  bookingTable,
  verifyBookingTable,
  forgotPassword,
  updatePassword,
};
