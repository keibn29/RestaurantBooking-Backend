import db from "../models/index";
import fs from "fs";
import appRoot from "app-root-path";
import { LANGUAGES, LIST_STATUS } from "../constant";
import _ from "lodash";
import { isExistArrayAndNotEmpty } from "../condition";
require("dotenv").config();
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";

const buildUrlEmail = (token) => {
  return `${process.env.URL_REACT}/verify-booking-table?token=${token}`;
};

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

      await emailService.sendSimpleEmail({
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
        redirectLink: buildUrlEmail(token),
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

const verifyBookingTable = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!token) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      } else {
        let existBooked = await db.Booking.findOne({
          where: {
            token: token,
          },
        });

        if (!existBooked) {
          return resolve({
            errCode: 2,
            errMessage: "Lịch đặt bàn không tồn tại",
          });
        }

        if (existBooked.statusId !== LIST_STATUS.NEW) {
          return resolve({
            errCode: 3,
            errMessage: "Lịch đặt bàn đã được xác nhận trước đó",
          });
        }

        existBooked.statusId = LIST_STATUS.VERIFIED;
        await existBooked.save();

        return resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      return reject(e);
    }
  });
};

module.exports = {
  bookingTable,
  verifyBookingTable,
};
