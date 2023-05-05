import db from "../models/index";
import fs from "fs";
import appRoot from "app-root-path";
import {
  GENERAL_STATUS,
  LANGUAGES,
  LIST_STATUS,
  OBJECT,
  PAGE,
  PAGE_LOGIN,
} from "../constant";
import _ from "lodash";
import {
  isExistArrayAndNotEmpty,
  unlinkSyncMultiFile,
  paginationListResult,
} from "../condition";
import { Op } from "sequelize";
import emailService from "./emailService";

const createNewRestaurant = (data, listFile, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.isSendAvatar ||
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
        unlinkSyncMultiFile(listFile);
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

      let isSendAvatar = JSON.parse(data.isSendAvatar);
      let avatar = null;
      if (isExistArrayAndNotEmpty(listFile) && isSendAvatar) {
        avatar = `/images/restaurants/${listFile[0].filename}`;
      }

      let [newRestaurant, created] = await db.Restaurant.findOrCreate({
        where: {
          managerId: data.managerId,
        },
        defaults: {
          nameVi: data.nameVi,
          nameEn: data.nameEn,
          addressVi: data.addressVi,
          addressEn: data.addressEn,
          provinceId: data.provinceId,
          managerId: data.managerId,
          table: data.table,
          descriptionVi: data.descriptionVi,
          descriptionEn: data.descriptionEn,
          avatar: avatar,
        },
      });
      if (!created) {
        unlinkSyncMultiFile(listFile);
        return resolve({
          errCode: 3,
          errMessage: "Một người chỉ có thể quản lý một nhà hàng",
        });
      }

      if (isExistArrayAndNotEmpty(listFile)) {
        let listPhoto = [];
        let listFileSlice = listFile;
        if (isSendAvatar) {
          listFileSlice = listFile.slice(1);
        }

        listFileSlice.map((item) => {
          let obj = {
            objectId: OBJECT.RESTAURANT,
            idMap: newRestaurant.id,
            link: `/images/restaurants/${item.filename}`,
          };
          listPhoto.push(obj);
          return listPhoto;
        });

        await db.Image.bulkCreate(listPhoto);
      }

      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      unlinkSyncMultiFile(listFile);
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

      let options = {
        where: {},
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
        distinct: true,
      };

      if (data.page === PAGE.HOMEPAGE) {
        options.include = [
          ...options.include,
          {
            model: db.Dish,
            as: "dishData",
            attributes: ["nameVi", "priceVi", "priceEn", "countryId"],
            include: [
              {
                model: db.Allcode,
                as: "countryData",
                attributes: ["valueVi", "valueEn"],
              },
            ],
          },
        ];
      }

      if (data.keyword) {
        let listKeywordSplit = data.keyword.trim().split(" ");
        options.where[Op.or] = listKeywordSplit.map((item) => {
          if (language === LANGUAGES.VI) {
            return { nameVi: { [Op.substring]: item } };
          }
          return { nameEn: { [Op.substring]: item } };
        });
      }

      if (data.provinceId) {
        options.where.provinceId = data.provinceId;
      }

      if (isExistArrayAndNotEmpty(data.listCountryId)) {
        options.include = [
          ...options.include,
          {
            model: db.Dish,
            as: "dishData",
            where: {
              countryId: {
                [Op.in]: data.listCountryId,
              },
            },
            attributes: ["id"],
          },
        ];
      }

      if (isExistArrayAndNotEmpty(data.priceRange)) {
        options.order = [
          [{ model: db.Dish, as: "dishData" }, "countryId", "ASC"],
          [{ model: db.Dish, as: "dishData" }, "nameVi", "ASC"],
        ];
        options.include = [
          ...options.include,
          {
            model: db.Dish,
            as: "dishData",
            where:
              language === LANGUAGES.VI
                ? {
                    priceVi: {
                      [Op.between]: data.priceRange,
                    },
                  }
                : {
                    priceEn: {
                      [Op.between]: data.priceRange,
                    },
                  },
            attributes: ["id"],
          },
        ];
      }

      if (data.table && data.date && data.timeType) {
        options.where.table = {
          [Op.gte]: data.table,
        };
        options.order = [
          ...options.order,
          [{ model: db.Schedule, as: "scheduleData" }, "timeType", "ASC"],
        ];
        options.include = [
          ...options.include,
          {
            model: db.Schedule,
            as: "scheduleData",
            where: {
              date: `${data.date}`,
              timeType: data.timeType,
            },
            attributes: ["id"],
          },
        ];
      }

      let listRestaurant = await db.Restaurant.findAll(options);
      listRestaurant = listRestaurant.map((item) => item.get({ plain: true }));

      if (data.page === PAGE.HOMEPAGE || data.page === PAGE.SEARCHPAGE) {
        listRestaurant = await sortListRestaurantByAverageScore(listRestaurant);
      }

      if (
        isExistArrayAndNotEmpty(listRestaurant) &&
        isExistArrayAndNotEmpty(data.scoreRange)
      ) {
        listRestaurant = filterListRestaurantByScoreRange(
          listRestaurant,
          data.scoreRange
        );
      }

      const totalRestaurant = listRestaurant.length;

      if (isExistArrayAndNotEmpty(listRestaurant)) {
        listRestaurant = paginationListResult(
          listRestaurant,
          data.pageOrder,
          data.pageSize
        );
      }

      if (isExistArrayAndNotEmpty(listRestaurant)) {
        let no = (data.pageOrder - 1) * data.pageSize + 1;
        listRestaurant = listRestaurant.map((item) => {
          item.no = no;
          no++;

          return item;
        });
      }

      return resolve({
        errCode: 0,
        totalRestaurant,
        listRestaurant,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const sortListRestaurantByAverageScore = async (listRestaurant) => {
  if (!isExistArrayAndNotEmpty(listRestaurant)) {
    return [];
  }

  let listReview = await db.Review.findAll();

  let listAverageScore = [];
  listReview.reduce((acc, curr) => {
    const existAverageScore = listAverageScore.find(
      (item) => item.restaurantId === curr.restaurantId
    );

    if (!existAverageScore) {
      listAverageScore.push({
        restaurantId: curr.restaurantId,
        score: curr.star,
        totalReview: 1,
      });

      acc[curr.restaurantId] = 1;
    } else {
      existAverageScore.score =
        (existAverageScore.score * acc[existAverageScore.restaurantId] +
          curr.star) /
        (acc[existAverageScore.restaurantId] + 1);
      existAverageScore.totalReview++;
      acc[existAverageScore.restaurantId]++;
    }

    return acc;
  }, {});

  let newListRestaurant = listRestaurant.map((restaurantItem) => {
    let obj = listAverageScore.find(
      (averageItem) => averageItem.restaurantId === restaurantItem.id
    );
    if (!_.isEmpty(obj)) {
      let scoreFixed = obj.score.toFixed(1);
      restaurantItem.averageScore = scoreFixed;
      restaurantItem.totalReview = obj.totalReview;
    } else {
      restaurantItem.averageScore = 0;
      restaurantItem.totalReview = 0;
    }
    return restaurantItem;
  });

  newListRestaurant.sort((a, b) => b.averageScore - a.averageScore);

  return newListRestaurant;
};

const filterListRestaurantByScoreRange = (listRestaurant, scoreRange) => {
  let newListRestaurant = listRestaurant.filter(
    (item) =>
      item.averageScore >= scoreRange[0] && item.averageScore <= scoreRange[1]
  );

  return newListRestaurant;
};

const editRestaurantById = (restaurantId, data, listFile, fileError) => {
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
        unlinkSyncMultiFile(listFile);
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
        unlinkSyncMultiFile(listFile);
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
      if (isExistArrayAndNotEmpty(listFile)) {
        let listFileSlice = listFile;
        let isSendAvatar = JSON.parse(data.isSendAvatar);
        if (isSendAvatar) {
          let avatarPath = appRoot + "/src/public" + restaurant.avatar;
          if (fs.existsSync(avatarPath)) {
            fs.unlinkSync(avatarPath);
          }
          restaurant.avatar = `/images/restaurants/${listFile[0].filename}`;
          listFileSlice = listFile.slice(1);
        }

        if (isExistArrayAndNotEmpty(listFileSlice)) {
          await editPhotoOfRestaurant(restaurantId, listFileSlice);
        }
      }

      await restaurant.save();

      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      unlinkSyncMultiFile(listFile);
      return reject(e);
    }
  });
};

const editPhotoOfRestaurant = async (restaurantId, listPhotoNew) => {
  let listExistPhoto = await db.Image.findAll({
    where: {
      objectId: OBJECT.RESTAURANT,
      idMap: restaurantId,
    },
  });
  if (isExistArrayAndNotEmpty(listExistPhoto)) {
    listExistPhoto.forEach(async (item) => {
      let imagePath = appRoot + "/src/public" + item.link;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      await item.destroy();
    });
  }

  let listPhoto = [];
  listPhotoNew.map((item) => {
    let obj = {
      objectId: OBJECT.RESTAURANT,
      idMap: restaurantId,
      link: `/images/restaurants/${item.filename}`,
    };
    listPhoto.push(obj);
    return listPhoto;
  });

  await db.Image.bulkCreate(listPhoto);
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
      await deletePhotoOfRestaurant(restaurantId);

      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const deletePhotoOfRestaurant = async (restaurantId) => {
  let listExistPhoto = await db.Image.findAll({
    where: {
      objectId: OBJECT.RESTAURANT,
      idMap: restaurantId,
    },
  });
  if (isExistArrayAndNotEmpty(listExistPhoto)) {
    listExistPhoto.forEach(async (item) => {
      let imagePath = appRoot + "/src/public" + item.link;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      await item.destroy();
    });
  }
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

const searchScheduleByDate = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.date) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let options = {
        where: {
          date: `${data.date}`,
        },
        order: [["timeType", "ASC"]],
        include: [
          {
            model: db.Allcode,
            as: "timeTypeData",
            attributes: ["valueVi", "valueEn"],
          },
        ],
      };

      if (data.restaurantId) {
        options.where.restaurantId = data.restaurantId;
      }

      if (data.listRestaurantId) {
        options.where[Op.or] = data.listRestaurantId.map((item) => {
          return { restaurantId: item };
        });
      }

      let listSchedule = await db.Schedule.findAll(options);
      listSchedule = listSchedule.map((item) => item.get({ plain: true }));

      if (isExistArrayAndNotEmpty(listSchedule) && data.isFilterByNowTime) {
        listSchedule = filterListScheduleByNowTime(listSchedule);
      }

      return resolve({
        errCode: 0,
        listSchedule,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const filterListScheduleByNowTime = (listSchedule) => {
  let newListSchedule = listSchedule.filter((item) => {
    const nowDateTimestamp = new Date().setHours(0, 0, 0, 0);
    if (+item.date !== nowDateTimestamp) {
      return item;
    }

    const time = item.timeTypeData.valueVi;
    const hours = parseInt(time.split(":")[0]);
    const minutes = parseInt(time.split(":")[1]);

    const scheduleTime = new Date();
    scheduleTime.setHours(hours);
    scheduleTime.setMinutes(minutes);

    const nowTime = new Date();

    return scheduleTime > nowTime;
  });

  return newListSchedule;
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
        order: [
          ["statusId", "ASC"],
          ["id", "DESC"],
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
            model: db.Restaurant,
            as: "restaurantData",
            attributes: ["nameVi", "nameEn", "avatar"],
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

      if (data.customerId) {
        options.where.customerId = data.customerId;
      }

      let listBooking = await db.Booking.findAll(options);
      listBooking = listBooking.map((item) => item.get({ plain: true }));

      if (isExistArrayAndNotEmpty(listBooking)) {
        listBooking = await updateListBooking(listBooking);
      }

      if (
        isExistArrayAndNotEmpty(listBooking) &&
        data.restaurantId &&
        data.date &&
        data.generalStatus
      ) {
        listBooking = filterBookingByGeneralStatus(listBooking, data);
      }

      const totalBooking = listBooking.length;

      if (isExistArrayAndNotEmpty(listBooking)) {
        listBooking = paginationListResult(
          listBooking,
          data.pageOrder,
          data.pageSize
        );
      }

      if (isExistArrayAndNotEmpty(listBooking)) {
        let no = (data.pageOrder - 1) * data.pageSize + 1;
        listBooking = listBooking.map((item) => {
          item.no = no;
          no++;

          return item;
        });
      }

      return resolve({
        errCode: 0,
        totalBooking,
        listBooking,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const updateListBooking = async (listBooking) => {
  let newListBooking = listBooking.map((item) => {
    const time = item.timeTypeData.valueVi;
    const hours = parseInt(time.split(":")[0]);
    const minutes = parseInt(time.split(":")[1]);
    const dateBooking = new Date(+item.date);
    dateBooking.setHours(hours);
    dateBooking.setMinutes(minutes);

    const now = new Date();

    if (
      item.statusId !== LIST_STATUS.CONFIRMED &&
      item.statusId !== LIST_STATUS.DONE &&
      item.statusId !== LIST_STATUS.OVERDUE &&
      dateBooking < now
    ) {
      item.statusId = LIST_STATUS.OVERDUE;
    }

    return item;
  });

  await updateOverdueBooking(newListBooking);

  return newListBooking;
};

const updateOverdueBooking = async (newListBooking) => {
  for (const item of newListBooking) {
    await db.Booking.update(
      {
        statusId: item.statusId,
      },
      {
        where: {
          id: item.id,
        },
      }
    );
  }
};

const filterBookingByGeneralStatus = (listBooking, data) => {
  let newListBooking = listBooking.filter(
    (item) =>
      item.restaurantId === data.restaurantId && item.date === `${data.date}`
  );

  if (data.generalStatus === GENERAL_STATUS.SLACKING) {
    newListBooking = newListBooking.filter(
      (item) =>
        item.statusId === LIST_STATUS.VERIFIED ||
        item.statusId === LIST_STATUS.CONFIRMED
    );
  } else if (data.generalStatus === GENERAL_STATUS.DONE) {
    newListBooking = newListBooking.filter(
      (item) => item.statusId === LIST_STATUS.DONE
    );
  } else {
    newListBooking = newListBooking.filter(
      (item) => item.statusId === LIST_STATUS.OVERDUE
    );
  }

  return newListBooking;
};

const confirmBookingTable = (bookingId) => {
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
          statusId: LIST_STATUS.VERIFIED,
        },
      });
      if (!existBook) {
        return resolve({
          errCode: 2,
          errMessage: "Đơn đặt bàn không tồn tại",
        });
      }

      existBook.statusId = LIST_STATUS.CONFIRMED;
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

let doneBookingTable = (bookingId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !bookingId ||
        !data.customerId ||
        !data.restaurantId ||
        !data.language ||
        !data.imageBase64
      ) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let customer = await db.User.findOne({
        where: {
          id: data.customerId,
        },
      });
      if (!customer) {
        return resolve({
          errCode: 2,
          errMessage: "Người dùng không tồn tại",
        });
      }

      let restaurant = await db.Restaurant.findOne({
        where: {
          id: data.restaurantId,
        },
      });
      if (!restaurant) {
        return resolve({
          errCode: 3,
          errMessage: "Nhà hàng không tồn tại",
        });
      }

      let booking = await db.Booking.findOne({
        where: {
          id: bookingId,
          customerId: data.customerId,
          restaurantId: data.restaurantId,
          statusId: LIST_STATUS.CONFIRMED,
        },
      });
      if (!booking) {
        return resolve({
          errCode: 3,
          errMessage: "Đơn đặt bàn không tồn tại",
        });
      }

      await emailService.sendEmaillBill({
        receiverEmail: customer.email,
        customerName:
          data.language === LANGUAGES.VI
            ? `${customer.lastName} ${customer.firstName}`
            : `${customer.firstName} ${customer.lastName}`,
        restaurantName:
          data.language === LANGUAGES.VI
            ? restaurant.nameVi
            : restaurant.nameEn,
        image: data.imageBase64,
        language: data.language,
      });

      booking.statusId = LIST_STATUS.DONE;
      await booking.save();

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

      let listExistDishOrder = await db.DishOrder.findAll({
        where: {
          bookingId: existBook.id,
        },
      });

      if (isExistArrayAndNotEmpty(listExistDishOrder)) {
        listExistDishOrder.forEach(async (item) => {
          await item.destroy();
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

const getRestaurantById = (restaurantId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!restaurantId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let existRestaurant = await db.Restaurant.findOne({
        where: {
          id: restaurantId,
        },
        include: [
          {
            model: db.User,
            as: "managerData",
            attributes: ["firstName", "lastName", "phone"],
          },
          {
            model: db.Allcode,
            as: "provinceData",
            attributes: ["valueVi", "valueEn"],
          },
          {
            model: db.Dish,
            as: "dishData",
            attributes: ["nameVi", "priceVi", "priceEn", "countryId"],
            include: [
              {
                model: db.Allcode,
                as: "countryData",
                attributes: ["valueVi", "valueEn"],
              },
            ],
          },
        ],
      });
      if (!existRestaurant) {
        return resolve({
          errCode: 2,
          errMessage: "Nhà hàng không tồn tại",
        });
      }

      return resolve({
        errCode: 0,
        restaurant: existRestaurant,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const searchReviewByRestaurant = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.pageOrder || !data.pageSize || !data.restaurantId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let { count, rows } = await db.Review.findAndCountAll({
        where: {
          restaurantId: data.restaurantId,
        },
        offset: (data.pageOrder - 1) * data.pageSize,
        limit: data.pageSize,
        order: [["updatedAt", "DESC"]],
        include: [
          {
            model: db.User,
            as: "customerData",
            attributes: ["firstName", "lastName", "avatar"],
          },
        ],
      });

      return resolve({
        errCode: 0,
        listReview: rows,
        totalReview: count,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const addNewReview = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.customerId || !data.restaurantId || !data.star) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let existBook = await db.Booking.findOne({
        where: {
          restaurantId: data.restaurantId,
          customerId: data.customerId,
          statusId: LIST_STATUS.DONE,
        },
      });
      if (!existBook) {
        return resolve({
          errCode: 3,
          errMessage:
            "Bạn không thể để lại đánh giá nếu chưa từng dùng bữa tại nhà hàng",
        });
      }

      let [newReview, created] = await db.Review.findOrCreate({
        where: {
          customerId: data.customerId,
          restaurantId: data.restaurantId,
        },
        defaults: {
          customerId: data.customerId,
          restaurantId: data.restaurantId,
          star: data.star,
          detail: data.detail,
        },
      });
      if (!created) {
        return resolve({
          errCode: 2,
          errMessage:
            "Bạn đã để lại đánh giá trước đó, không thể thêm đánh giá mới",
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

const editReviewById = (reviewId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!reviewId || !data.customerId || !data.restaurantId || !data.star) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let existReview = await db.Review.findOne({
        where: {
          id: reviewId,
        },
      });
      if (!existReview) {
        return resolve({
          errCode: 2,
          errMessage: "Đánh giá này không tồn tại",
        });
      }

      existReview.star = data.star;
      existReview.detail = data.detail;
      await existReview.save();

      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const getReviewByCustomerAndRestaurant = (restaurantId, customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!restaurantId || !customerId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let existReview = await db.Review.findOne({
        where: {
          restaurantId: restaurantId,
          customerId: customerId,
        },
      });

      if (!existReview) {
        return resolve({
          errCode: 2,
          errMessage: "Đánh giá không tồn tại",
        });
      }

      return resolve({
        errCode: 0,
        reviewData: existReview,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const getListScoreByRestaurant = (restaurantId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!restaurantId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let listReview = await db.Review.findAll({
        where: {
          restaurantId: restaurantId,
        },
        raw: true,
        nest: true,
      });

      let listNumberScore = [];
      if (isExistArrayAndNotEmpty(listReview)) {
        listNumberScore = listReview.reduce(
          (acc, curr) => {
            acc[curr.star - 1]++;
            return acc;
          },
          [0, 0, 0, 0, 0]
        );
      }

      let averageScore = 0;
      if (isExistArrayAndNotEmpty(listNumberScore)) {
        const totalScore = listNumberScore.reduce((acc, curr, index) => {
          return acc + curr * (index + 1);
        }, 0);
        averageScore = (totalScore / listReview.length).toFixed(1);
      }

      return resolve({
        errCode: 0,
        listNumberScore,
        averageScore,
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
  doneBookingTable,
  deleteBookingById,
  getRestaurantById,
  addNewReview,
  editReviewById,
  searchReviewByRestaurant,
  getReviewByCustomerAndRestaurant,
  getListScoreByRestaurant,
};
