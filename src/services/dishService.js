import db from "../models/index";
import fs from "fs";
import appRoot from "app-root-path";
const { Op } = require("sequelize");
import { LANGUAGES } from "../constant";
import { isExistArrayAndNotEmpty } from "../condition";
import mime from "mime-types";

const createNewDish = (data, file, fileError) => {
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

      await db.Dish.create({
        nameVi: data.nameVi,
        nameEn: data.nameEn,
        priceVi: data.priceVi,
        priceEn: data.priceEn,
        restaurantId: data.restaurantId,
        countryId: data.countryId,
        descriptionVi: data.descriptionVi,
        descriptionEn: data.descriptionEn,
        avatar: file ? `/images/dishes/${file.filename}` : null,
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

const searchDish = (data, language) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.pageSize || !data.pageOrder || !language) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      const keyword = data.keyword || "";
      let options = {
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
          ["id", "ASC"],
        ];
        options.raw = true;
        options.nest = true;
      }

      let { count, rows } = await db.Dish.findAndCountAll(options);

      if (isExistArrayAndNotEmpty(rows)) {
        rows = rows.map((item) => {
          if (item.avatar) {
            let avatarPath = appRoot + "/src/public" + item.avatar;
            let avatarBase64 = fs.readFileSync(avatarPath, "base64");
            let mimeType = mime.lookup(avatarPath);

            item.avatarBase64 = `data:${mimeType};base64,${avatarBase64}`;
          }
          return item;
        });
      }

      return resolve({
        errCode: 0,
        totalDish: count,
        listDish: rows,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const editDishById = (dishId, data, file, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !dishId ||
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

      let dish = await db.Dish.findOne({
        where: {
          id: dishId,
        },
      });

      if (!dish) {
        if (file) {
          fs.unlinkSync(file.path);
        }
        return resolve({
          errCode: 3,
          errMessage: "Không tìm thấy món ăn",
        });
      }
      dish.nameVi = data.nameVi;
      dish.nameEn = data.nameEn;
      dish.priceVi = data.priceVi;
      dish.priceEn = data.priceEn;
      dish.countryId = data.countryId;
      dish.descriptionVi = data.descriptionVi;
      dish.descriptionEn = data.descriptionEn;
      if (file) {
        let avatarPath = appRoot + "/src/public" + dish.avatar;
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
        dish.avatar = `/images/dishes/${file.filename}`;
      }
      await dish.save();
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

const deleteDishById = (dishId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!dishId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let dish = await db.Dish.findOne({
        where: {
          id: dishId,
        },
      });
      if (!dish) {
        return resolve({
          errCode: 2,
          errMessage: "Không tìm thấy món ăn",
        });
      }

      if (dish.avatar) {
        let avatarPath = appRoot + "/src/public" + dish.avatar;
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }
      await dish.destroy();
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
  createNewDish,
  searchDish,
  editDishById,
  deleteDishById,
};
