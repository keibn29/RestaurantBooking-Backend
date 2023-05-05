import db from "../models/index";
import fs from "fs";
import appRoot from "app-root-path";
const { Op } = require("sequelize");
import { LANGUAGES, OBJECT, PAGE } from "../constant";
import {
  isExistArrayAndNotEmpty,
  paginationListResult,
  unlinkSyncMultiFile,
} from "../condition";
import mime from "mime-types";
import _ from "lodash";

const createNewDish = (data, listFile, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.nameVi ||
        !data.nameEn ||
        !data.dishType ||
        !data.priceVi ||
        !data.priceEn ||
        !data.restaurantId ||
        !data.countryId ||
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
        avatar = `/images/dishes/${listFile[0].filename}`;
      }

      let newDish = await db.Dish.create({
        nameVi: data.nameVi,
        nameEn: data.nameEn,
        dishType: data.dishType,
        priceVi: data.priceVi,
        priceEn: data.priceEn,
        restaurantId: data.restaurantId,
        countryId: data.countryId,
        descriptionVi: data.descriptionVi,
        descriptionEn: data.descriptionEn,
        avatar: avatar,
      });

      if (isExistArrayAndNotEmpty(listFile)) {
        let listPhoto = [];
        let listFileSlice = listFile;
        if (isSendAvatar) {
          listFileSlice = listFile.slice(1);
        }

        listFileSlice.map((item) => {
          let obj = {
            objectId: OBJECT.DISH,
            idMap: newDish.id,
            link: `/images/dishes/${item.filename}`,
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

const searchDish = (data, language) => {
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
        include: [
          {
            model: db.Allcode,
            as: "countryData",
            attributes: ["valueVi", "valueEn"],
          },
          {
            model: db.Allcode,
            as: "dishTypeData",
            attributes: ["valueVi", "valueEn"],
          },
          {
            model: db.Restaurant,
            as: "restaurantData",
            attributes: ["nameVi", "nameEn"],
            include: [
              {
                model: db.Allcode,
                as: "provinceData",
                attributes: ["valueVi", "valueEn"],
              },
            ],
          },
        ],
        distinct: true,
      };

      if (data.keyword) {
        let listKeywordSplit = data.keyword.trim().split(" ");
        options.where[Op.or] = listKeywordSplit.map((item) => {
          if (language === LANGUAGES.VI) {
            return { nameVi: { [Op.substring]: item } };
          }
          return { nameEn: { [Op.substring]: item } };
        });
      }

      if (data.restaurantId) {
        options.where.restaurantId = data.restaurantId;
        options.order = [
          language === LANGUAGES.VI ? ["nameVi", "ASC"] : ["nameEn", "ASC"],
          ["id", "ASC"],
        ];
      }

      if (data.dishType) {
        options.where.dishType = data.dishType;
      }

      if (data.provinceId) {
        options.include = [
          ...options.include,
          {
            model: db.Restaurant,
            as: "restaurantData",
            attributes: ["id", "provinceId"],
            where: {
              provinceId: data.provinceId,
            },
          },
        ];
      }

      if (isExistArrayAndNotEmpty(data.listCountryId)) {
        options.where[Op.or] = data.listCountryId.map((item) => {
          return { countryId: item };
        });
      }

      if (isExistArrayAndNotEmpty(data.priceRange)) {
        options.where.priceVi = {
          [Op.between]: data.priceRange,
        };
      }

      if (isExistArrayAndNotEmpty(data.listRestaurantId)) {
        options.where[Op.or] = data.listRestaurantId.map((item) => {
          return { restaurantId: item };
        });
        options.attributes = [
          "nameVi",
          "priceVi",
          "priceEn",
          "countryId",
          "restaurantId",
        ];
      }

      let { count, rows } = await db.Dish.findAndCountAll(options);
      let listDish = rows.map((item) => item.get({ plain: true }));

      if (data.page === PAGE.HOMEPAGE || data.page === PAGE.SEARCHPAGE) {
        listDish = await sortListDishByNumberOrder(listDish);
      }

      if (isExistArrayAndNotEmpty(listDish)) {
        listDish = paginationListResult(
          listDish,
          data.pageOrder,
          data.pageSize
        );
      }

      if (isExistArrayAndNotEmpty(listDish)) {
        let no = (data.pageOrder - 1) * data.pageSize + 1;
        listDish = listDish.map((item) => {
          item.no = no;
          no++;

          if (item.avatar) {
            let avatarPath = appRoot + "/src/public" + item.avatar;
            let base64 = fs.readFileSync(avatarPath, "base64");
            let mimeType = mime.lookup(avatarPath);

            item.avatarBase64 = `data:${mimeType};base64,${base64}`;
          }

          return item;
        });
      }

      return resolve({
        errCode: 0,
        totalDish: count,
        listDish,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const sortListDishByNumberOrder = async (listDish) => {
  if (!isExistArrayAndNotEmpty(listDish)) {
    return [];
  }

  let listDishOrder = await db.DishOrder.findAll();

  let listNumberOrder = [];
  listDishOrder.reduce((acc, curr) => {
    const existNumberOrder = listNumberOrder.find(
      (item) => item.dishId === curr.dishId
    );

    if (!existNumberOrder) {
      listNumberOrder.push({
        dishId: curr.dishId,
        totalOrder: 1,
      });

      acc[curr.restaurantId] = 1;
    } else {
      existNumberOrder.totalOrder++;
      acc[existNumberOrder.dishId]++;
    }

    return acc;
  }, {});

  let newListDish = listDish.map((dishItem) => {
    let obj = listNumberOrder.find(
      (numberOrderItem) => numberOrderItem.dishId === dishItem.id
    );
    if (!_.isEmpty(obj)) {
      dishItem.totalOrder = obj.totalOrder;
    } else {
      dishItem.totalOrder = 0;
    }
    return dishItem;
  });

  newListDish.sort((a, b) => b.totalOrder - a.totalOrder);

  return newListDish;
};

const editDishById = (dishId, data, listFile, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !dishId ||
        !data.nameVi ||
        !data.nameEn ||
        !data.priceVi ||
        !data.priceEn ||
        !data.restaurantId ||
        !data.dishType ||
        !data.countryId ||
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

      let dish = await db.Dish.findOne({
        where: {
          id: dishId,
        },
      });

      if (!dish) {
        unlinkSyncMultiFile(listFile);
        return resolve({
          errCode: 3,
          errMessage: "Không tìm thấy món ăn",
        });
      }
      dish.nameVi = data.nameVi;
      dish.nameEn = data.nameEn;
      dish.priceVi = data.priceVi;
      dish.priceEn = data.priceEn;
      dish.dishType = data.dishType;
      dish.countryId = data.countryId;
      dish.descriptionVi = data.descriptionVi;
      dish.descriptionEn = data.descriptionEn;
      if (isExistArrayAndNotEmpty(listFile)) {
        let listFileSlice = listFile;
        let isSendAvatar = JSON.parse(data.isSendAvatar);
        if (isSendAvatar) {
          let avatarPath = appRoot + "/src/public" + dish.avatar;
          if (fs.existsSync(avatarPath)) {
            fs.unlinkSync(avatarPath);
          }
          dish.avatar = `/images/dishes/${listFile[0].filename}`;
          listFileSlice = listFile.slice(1);
        }

        if (isExistArrayAndNotEmpty(listFileSlice)) {
          await editPhotoOfDish(dishId, listFileSlice);
        }
      }

      await dish.save();

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

const editPhotoOfDish = async (dishId, listPhotoNew) => {
  let listExistPhoto = await db.Image.findAll({
    where: {
      objectId: OBJECT.DISH,
      idMap: dishId,
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
      objectId: OBJECT.DISH,
      idMap: dishId,
      link: `/images/dishes/${item.filename}`,
    };
    listPhoto.push(obj);
    return listPhoto;
  });

  await db.Image.bulkCreate(listPhoto);
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
      await deletePhotoOfDish(dishId);

      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const deletePhotoOfDish = async (dishId) => {
  let listExistPhoto = await db.Image.findAll({
    where: {
      objectId: OBJECT.DISH,
      idMap: dishId,
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

module.exports = {
  createNewDish,
  searchDish,
  editDishById,
  deleteDishById,
};
