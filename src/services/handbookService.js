import db from "../models/index";
import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);
const { Op } = require("sequelize");
import fs from "fs";
import appRoot from "app-root-path";
import { LANGUAGES, PAGE_LOGIN, USER_ROLE } from "../constant";
import { isExistArrayAndNotEmpty } from "../condition";

const createNewHandbook = (data, file, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.titleVi ||
        !data.titleEn ||
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

      await db.Handbook.create({
        titleVi: data.titleVi,
        titleEn: data.titleEn,
        descriptionVi: data.descriptionVi,
        descriptionEn: data.descriptionEn,
        image: file ? `/images/handbooks/${file.filename}` : null,
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

const searchHandbook = (data) => {
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
        order: [["id", "DESC"]],
      };

      if (data.keyword) {
        let listKeywordSplit = data.keyword.trim().split(" ");
        options.where[Op.or] = listKeywordSplit.map((item) => {
          if (data.language === LANGUAGES.VI) {
            return { titleVi: { [Op.substring]: item } };
          }
          return { titleEn: { [Op.substring]: item } };
        });
      }

      let { count, rows } = await db.Handbook.findAndCountAll(options);

      let listHandbook = rows.map((item) => item.get({ plain: true }));

      if (isExistArrayAndNotEmpty(listHandbook)) {
        let no = (data.pageOrder - 1) * data.pageSize + 1;
        listHandbook = listHandbook.map((item) => {
          item.no = no;
          no++;

          return item;
        });
      }

      return resolve({
        errCode: 0,
        totalHandbook: count,
        listHandbook,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const editHandbookById = (handbookId, data, file, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !handbookId ||
        !data.titleVi ||
        !data.titleEn ||
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

      let existHandbook = await db.Handbook.findOne({
        where: {
          id: handbookId,
        },
      });
      if (!existHandbook) {
        if (file) {
          fs.unlinkSync(file.path);
        }
        return resolve({
          errCode: 3,
          errMessage: "Không tìm thấy bài đăng",
        });
      }

      existHandbook.titleVi = data.titleVi;
      existHandbook.titleEn = data.titleEn;
      existHandbook.descriptionVi = data.descriptionVi;
      existHandbook.descriptionEn = data.descriptionEn;
      if (file) {
        let imagePath = appRoot + "/src/public" + existHandbook.image;
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        existHandbook.image = `/images/handbooks/${file.filename}`;
      }

      await existHandbook.save();

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

const deleteHandbookById = (handbookId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!handbookId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let existHandbook = await db.Handbook.findOne({
        where: {
          id: handbookId,
        },
      });
      if (!existHandbook) {
        return resolve({
          errCode: 2,
          errMessage: "Không tìm thấy bài đăng",
        });
      }
      if (existHandbook.image) {
        let imagePath = appRoot + "/src/public" + existHandbook.image;
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      await existHandbook.destroy();
      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const getHandbookById = (handbookId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!handbookId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let existHandbook = await db.Handbook.findOne({
        where: {
          id: handbookId,
        },
      });
      if (!existHandbook) {
        return resolve({
          errCode: 2,
          errMessage: "Bài đăng không tồn tại",
        });
      }

      return resolve({
        errCode: 0,
        handbook: existHandbook,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

module.exports = {
  createNewHandbook,
  searchHandbook,
  editHandbookById,
  deleteHandbookById,
  getHandbookById,
};
