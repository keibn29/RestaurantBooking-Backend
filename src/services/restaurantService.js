import db from "../models/index";
import fs from "fs";
import appRoot from "app-root-path";
import { GENERAL_STATUS, LANGUAGES, LIST_STATUS } from "../constant";
import _ from "lodash";
import { isExistArrayAndNotEmpty } from "../condition";
import { Op } from "sequelize";

const createNewRestaurant = (data, file, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.nameVi ||
        !data.nameEn ||
        !data.addressVi ||
        !data.addressEn ||
        !data.provinceId ||
        !data.managerId ||
        !data.table ||
        !data.descriptionVi ||
        !data.descriptionEn
      ) {
        if (file) {
          fs.unlinkSync(file.path);
        }
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }
      if (fileError) {
        return resolve({
          errCode: 2,
          errMessage: "Ảnh không hợp lệ",
        });
      }

      await db.Restaurant.create({
        nameVi: data.nameVi,
        nameEn: data.nameEn,
        addressVi: data.addressVi,
        addressEn: data.addressEn,
        provinceId: data.provinceId,
        managerId: data.managerId,
        table: data.table,
        descriptionVi: data.descriptionVi,
        descriptionEn: data.descriptionEn,
        avatar: file ? `/images/restaurants/${file.filename}` : null,
      });
      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      return reject(e);
    }
  });
};

const searchRestaurant = (data, language) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.pageSize || !data.pageOrder || !language) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let { count, rows } = await db.Restaurant.findAndCountAll({
        offset: (data.pageOrder - 1) * data.pageSize,
        limit: data.pageSize,
        order: [
          language === LANGUAGES.VI ? ["nameVi", "ASC"] : ["nameEn", "ASC"],
          ["id", "ASC"],
        ],
        include: [
          {
            model: db.Allcode,
            as: "provinceData",
            attributes: ["valueVi", "valueEn"],
          },
          {
            model: db.User,
            as: "managerData",
            attributes: ["firstName", "lastName"],
          },
        ],
      });
      return resolve({
        errCode: 0,
        totalRestaurant: count,
        listRestaurant: rows,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const editRestaurantById = (restaurantId, data, file, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !restaurantId ||
        !data.nameVi ||
        !data.nameEn ||
        !data.addressVi ||
        !data.addressEn ||
        !data.provinceId ||
        !data.table ||
        !data.descriptionVi ||
        !data.descriptionEn
      ) {
        if (file) {
          fs.unlinkSync(file.path);
        }
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }
      if (fileError) {
        return resolve({
          errCode: 2,
          errMessage: "Ảnh không hợp lệ",
        });
      }

      let restaurant = await db.Restaurant.findOne({
        where: {
          id: restaurantId,
        },
      });

      if (!restaurant) {
        if (file) {
          fs.unlinkSync(file.path);
        }
        return resolve({
          errCode: 3,
          errMessage: "Không tìm thấy nhà hàng",
        });
      }
      restaurant.nameVi = data.nameVi;
      restaurant.nameEn = data.nameEn;
      restaurant.addressVi = data.addressVi;
      restaurant.addressEn = data.addressEn;
      restaurant.provinceId = data.provinceId;
      restaurant.table = data.table;
      restaurant.descriptionVi = data.descriptionVi;
      restaurant.descriptionEn = data.descriptionEn;
      if (file) {
        let avatarPath = appRoot + "/src/public" + restaurant.avatar;
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
        restaurant.avatar = `/images/restaurants/${file.filename}`;
      }
      await restaurant.save();
      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      return reject(e);
    }
  });
};

const deleteRestaurantById = (restaurantId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!restaurantId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let restaurant = await db.Restaurant.findOne({
        where: {
          id: restaurantId,
        },
      });
      if (!restaurant) {
        return resolve({
          errCode: 2,
          errMessage: "Không tìm thấy nhà hàng",
        });
      }

      if (restaurant.avatar) {
        let avatarPath = appRoot + "/src/public" + restaurant.avatar;
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }
      await restaurant.destroy();
      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.restaurantId ||
        !isExistArrayAndNotEmpty(data.listDateSelected) ||
        !isExistArrayAndNotEmpty(data.listTimeSelected)
      ) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let listDate = data.listDateSelected;
      let listTime = data.listTimeSelected;
      let listNewSchedule = [];
      listDate.map((dateItem) => {
        listTime.map((timeItem) => {
          let obj = {
            restaurantId: data.restaurantId,
            date: dateItem,
            timeType: timeItem.keyMap,
          };
          listNewSchedule.push(obj);
          return listNewSchedule;
        });
      });

      let listExistSchedule = await db.Schedule.findAll({
        where: {
          restaurantId: data.restaurantId,
        },
        attributes: ["restaurantId", "date", "timeType"],
        raw: true,
      });

      let listScheduleBulkCreate = _.differenceWith(
        listNewSchedule,
        listExistSchedule,
        (newItem, existItem) => {
          return (
            +newItem.date === +existItem.date &&
            newItem.timeType === existItem.timeType
          );
        }
      );

      if (!isExistArrayAndNotEmpty(listScheduleBulkCreate)) {
        return resolve({
          errCode: 2,
          errMessage: "Tất cả lịch muốn thêm đã tồn tại",
        });
      }

      await db.Schedule.bulkCreate(listScheduleBulkCreate);
      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const searchScheduleByDate = (restaurantId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!restaurantId || !date) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }
      let listSchedule = await db.Schedule.findAll({
        where: {
          restaurantId: restaurantId,
          date: `${date}`,
        },
        order: [["timeType", "ASC"]],
        include: [
          {
            model: db.Allcode,
            as: "timeTypeData",
            attributes: ["valueVi", "valueEn"],
          },
        ],
      });
      return resolve({
        errCode: 0,
        listSchedule,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const searchBooking = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.pageSize || !data.pageOrder) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let options = {
        where: {},
        offset: (data.pageOrder - 1) * data.pageSize,
        limit: data.pageSize,
        order: [
          ["statusId", "ASC"],
          ["id", "ASC"],
          [
            { model: db.DishOrder, as: "dishOrderData" },
            { model: db.Dish, as: "dishData" },
            "nameVi",
            "ASC",
          ],
        ],
        include: [
          {
            model: db.Allcode,
            as: "statusData",
            attributes: ["valueVi", "valueEn"],
          },
          {
            model: db.Allcode,
            as: "timeTypeData",
            attributes: ["valueVi", "valueEn"],
          },
          {
            model: db.User,
            as: "customerData",
            attributes: [
              "firstName",
              "lastName",
              "email",
              "phone",
              "address",
              "avatar",
            ],
          },
          {
            model: db.DishOrder,
            as: "dishOrderData",
            attributes: ["id"],
            include: [
              {
                model: db.Dish,
                as: "dishData",
                attributes: [
                  "avatar",
                  "nameVi",
                  "nameEn",
                  "priceVi",
                  "priceEn",
                ],
              },
            ],
          },
        ],
        distinct: true,
      };

      if (data.restaurantId && data.date) {
        options.where.restaurantId = data.restaurantId;
        options.where.date = `${data.date}`;
        if (data.generalStatus === GENERAL_STATUS.SLACKING) {
          options.where[Op.or] = [
            { statusId: LIST_STATUS.VERIFIED },
            { statusId: LIST_STATUS.CONFIRMED },
          ];
        } else {
          options.where.statusId = LIST_STATUS.DONE;
        }
      }

      let { count, rows } = await db.Booking.findAndCountAll(options);

      return resolve({
        errCode: 0,
        totalBooking: count,
        listBooking: rows,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const confirmBookingTable = (bookingId, statusId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!bookingId || !statusId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      if (
        statusId !== LIST_STATUS.VERIFIED &&
        statusId !== LIST_STATUS.CONFIRMED
      ) {
        return resolve({
          errCode: 2,
          errMessage: "Thông tin không chính xác",
        });
      }

      let existBook = await db.Booking.findOne({
        where: {
          id: bookingId,
          statusId: statusId,
        },
      });
      if (!existBook) {
        return resolve({
          errCode: 3,
          errMessage: "Đơn đặt bàn không tồn tại",
        });
      }

      if (existBook.statusId === LIST_STATUS.VERIFIED) {
        existBook.statusId = LIST_STATUS.CONFIRMED;
      } else {
        existBook.statusId = LIST_STATUS.DONE;
      }
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

const deleteBookingById = (bookingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!bookingId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let existBook = await db.Booking.findOne({
        where: {
          id: bookingId,
        },
      });
      if (!existBook) {
        return resolve({
          errCode: 2,
          errMessage: "Đơn đặt bàn không tồn tại",
        });
      }

      await existBook.destroy();

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
  createNewRestaurant,
  searchRestaurant,
  editRestaurantById,
  deleteRestaurantById,
  bulkCreateSchedule,
  searchScheduleByDate,
  searchBooking,
  confirmBookingTable,
  deleteBookingById,
};
