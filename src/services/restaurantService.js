import db from "../models/index";
import fs from "fs";
import appRoot from "app-root-path";
import { LANGUAGES } from "../constant";

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
        resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }
      if (fileError) {
        resolve({
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
      resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      reject(e);
    }
  });
};

const searchRestaurant = (data, language) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.pageSize || !data.pageOrder || !language) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let { count, rows } = await db.Restaurant.findAndCountAll({
        offset: (data.pageOrder - 1) * data.pageSize,
        limit: data.pageSize,
        order: [
          language === LANGUAGES.VI ? ["nameVi", "ASC"] : ["nameEn", "ASC"],
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
      resolve({
        errCode: 0,
        totalRestaurant: count,
        listRestaurant: rows,
      });
    } catch (e) {
      reject(e);
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
        resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }
      if (fileError) {
        resolve({
          errCode: 2,
          errMessage: "Ảnh không hợp lệ",
        });
      }

      let restaurant = await db.Restaurant.findOne({
        where: {
          id: restaurantId,
        },
      });
      if (restaurant) {
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
        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      } else {
        if (file) {
          fs.unlinkSync(file.path);
        }
        resolve({
          errCode: 3,
          errMessage: "Không tìm thấy người dùng",
        });
      }
    } catch (e) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      reject(e);
    }
  });
};

module.exports = {
  createNewRestaurant,
  searchRestaurant,
  editRestaurantById,
};
