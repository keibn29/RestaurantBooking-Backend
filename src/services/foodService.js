import db from "../models/index";
import fs from "fs";
import appRoot from "app-root-path";
const { Op } = require("sequelize");
import { LANGUAGES } from "../constant";

const createNewFood = (data, file, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.nameVi ||
        !data.nameEn ||
        !data.priceVi ||
        !data.priceEn ||
        !data.restaurantId ||
        !data.countryId ||
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

      await db.Food.create({
        nameVi: data.nameVi,
        nameEn: data.nameEn,
        priceVi: data.priceVi,
        priceEn: data.priceEn,
        restaurantId: data.restaurantId,
        countryId: data.countryId,
        descriptionVi: data.descriptionVi,
        descriptionEn: data.descriptionEn,
        avatar: file ? `/images/foods/${file.filename}` : null,
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

const searchFood = (data, language) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.pageSize || !data.pageOrder || !language) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }
      const keyword = data.keyword || "";

      const options = {
        where: {
          [Op.or]: [
            { nameVi: { [Op.substring]: keyword } },
            { countryId: { [Op.substring]: keyword } },
          ],
        },
        offset: (data.pageOrder - 1) * data.pageSize,
        limit: data.pageSize,
        // order: [["nameVi", "ASC"]],
        include: [
          {
            model: db.Allcode,
            as: "countryData",
            attributes: ["valueVi", "valueEn"],
          },
          {
            model: db.Restaurant,
            as: "restaurantData",
            attributes: ["nameVi", "nameEn"],
          },
        ],
      };
      if (data.restaurantId) {
        options.where.restaurantId = data.restaurantId;
        options.order = [
          language === LANGUAGES.VI ? ["nameVi", "ASC"] : ["nameEn", "ASC"],
        ];
      }

      let { count, rows } = await db.Food.findAndCountAll(options);

      resolve({
        errCode: 0,
        totalFood: count,
        listFood: rows,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const editFoodById = (foodId, data, file, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !foodId ||
        !data.nameVi ||
        !data.nameEn ||
        !data.priceVi ||
        !data.priceEn ||
        !data.restaurantId ||
        !data.countryId ||
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

      let food = await db.Food.findOne({
        where: {
          id: foodId,
        },
      });

      if (!food) {
        if (file) {
          fs.unlinkSync(file.path);
        }
        resolve({
          errCode: 3,
          errMessage: "Không tìm thấy món ăn",
        });
      }
      food.nameVi = data.nameVi;
      food.nameEn = data.nameEn;
      food.priceVi = data.priceVi;
      food.priceEn = data.priceEn;
      food.countryId = data.countryId;
      food.descriptionVi = data.descriptionVi;
      food.descriptionEn = data.descriptionEn;
      if (file) {
        let avatarPath = appRoot + "/src/public" + food.avatar;
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
        food.avatar = `/images/foods/${file.filename}`;
      }
      await food.save();
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

const deleteFoodById = (foodId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!foodId) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let food = await db.Food.findOne({
        where: {
          id: foodId,
        },
      });
      if (!food) {
        resolve({
          errCode: 2,
          errMessage: "Không tìm thấy món ăn",
        });
      }

      if (food.avatar) {
        let avatarPath = appRoot + "/src/public" + food.avatar;
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }
      await food.destroy();
      resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createNewFood,
  searchFood,
  editFoodById,
  deleteFoodById,
};
