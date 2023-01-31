import db from "../models/index";
import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);
const { Op } = require("sequelize");

const login = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.password) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let user = await db.User.findOne({
        where: {
          email: data.email,
        },
        raw: true,
      });
      if (user) {
        let check = bcrypt.compareSync(data.password, user.password);
        if (check) {
          delete user.password;
          resolve({
            errCode: 0,
            user,
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Mật khẩu không chính xác",
          });
        }
      } else {
        resolve({
          errCode: 3,
          errMessage: "Email chưa được đăng kí, vui lòng nhập email khác",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const createNewUser = (data, file, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.password ||
        !data.firstName ||
        !data.lastName ||
        !data.phone ||
        !data.roleId ||
        !data.address
      ) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      // let check = await db.User.findOne({
      //   where: {
      //     email: data.email,
      //   },
      // });
      // if (check) {
      //   resolve({
      //     errCode: 2,
      //     errMessage: "Email này đã được sử dụng, vui lòng nhập email khác",
      //   });
      // } else {
      //   let passwordHash = await bcrypt.hashSync(data.password, salt);
      // }

      if (fileError) {
        resolve({
          errCode: 2,
          errMessage: "Ảnh không hợp lệ",
        });
      }
      if (file) {
        console.log(file.filename);
      }

      let passwordHash = await bcrypt.hashSync(data.password, salt);
      let [newUser, created] = await db.User.findOrCreate({
        where: {
          email: data.email,
        },
        defaults: {
          email: data.email,
          password: passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
          roleId: data.roleId,
          avatar: file ? `/images/${file.filename}` : null,
        },
      });
      if (!created) {
        resolve({
          errCode: 2,
          errMessage: "Email này đã được sử dụng, vui lòng nhập email khác",
        });
      } else {
        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const searchUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.pageSize || !data.pageOrder) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }
      // if (!data.keyword) {
      //   data.keyword = "";
      // }

      let { count, rows } = await db.User.findAndCountAll({
        // where: {
        //   [Op.or]: [
        //     { email: { [Op.like]: "%" + data.keyword + "%" } },
        //     { firstName: { [Op.like]: "%" + data.keyword + "%" } },
        //     { lastName: { [Op.like]: "%" + data.keyword + "%" } },
        //   ],
        // },
        offset: (data.pageOrder - 1) * data.pageSize,
        limit: data.pageSize,
        attributes: {
          exclude: ["password"],
        },
        order: [["roleId", "ASC"]],
        include: [
          {
            model: db.Allcode,
            as: "roleData",
            attributes: ["valueVi", "valueEn"],
          },
        ],
      });
      resolve({
        errCode: 0,
        totalUser: count,
        listUser: rows,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllCode = (code) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!code) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }
      let listCode = await db.Allcode.findAll({
        where: {
          type: code,
        },
      });
      resolve({
        errCode: 0,
        listCode: listCode,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createNewUser,
  searchUser,
  login,
  getAllCode,
};
