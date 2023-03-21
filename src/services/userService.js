import db from "../models/index";
import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);
const { Op } = require("sequelize");
import fs from "fs";
import appRoot from "app-root-path";
import { PAGE_LOGIN, USER_ROLE } from "../constant";

const login = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.password || !data.pageLogin) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let user = await db.User.findOne({
        where: {
          email: data.email,
          roleId:
            data.pageLogin === PAGE_LOGIN.SYSTEM
              ? USER_ROLE.ADMIN || USER_ROLE.RESTAURANT_MANAGER
              : USER_ROLE.CUSTOMER,
        },
        raw: true,
      });
      if (!user) {
        return resolve({
          errCode: 3,
          errMessage: "Email không chính xác, vui lòng nhập email khác",
        });
      }
      let check = bcrypt.compareSync(data.password, user.password);
      if (check) {
        delete user.password;
        return resolve({
          errCode: 0,
          user,
        });
      }
      return resolve({
        errCode: 2,
        errMessage: "Mật khẩu không chính xác",
      });
    } catch (e) {
      return reject(e);
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
          avatar: file ? `/images/users/${file.filename}` : null,
        },
      });
      if (!created) {
        if (file) {
          fs.unlinkSync(file.path);
        }
        return resolve({
          errCode: 2,
          errMessage: "Email này đã được sử dụng, vui lòng nhập email khác",
        });
      }
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

const searchUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.pageSize || !data.pageOrder) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

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
        order: [
          ["roleId", "ASC"],
          ["id", "ASC"],
        ],
        include: [
          {
            model: db.Allcode,
            as: "roleData",
            attributes: ["valueVi", "valueEn"],
          },
        ],
      });
      return resolve({
        errCode: 0,
        totalUser: count,
        listUser: rows,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const editUserById = (userId, data, file, fileError) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !userId ||
        !data.firstName ||
        !data.lastName ||
        !data.phone ||
        !data.address ||
        !data.roleId
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

      let user = await db.User.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        if (file) {
          fs.unlinkSync(file.path);
        }
        return resolve({
          errCode: 3,
          errMessage: "Không tìm thấy người dùng",
        });
      }
      user.firstName = data.firstName;
      user.lastName = data.lastName;
      user.phone = data.phone;
      user.address = data.address;
      user.roleId = data.roleId;
      if (file) {
        let avatarPath = appRoot + "/src/public" + user.avatar;
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
        user.avatar = `/images/users/${file.filename}`;
      }
      await user.save();
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

const deleteUserById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let user = await db.User.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return resolve({
          errCode: 2,
          errMessage: "Không tìm thấy người dùng",
        });
      }
      if (user.avatar) {
        let avatarPath = appRoot + "/src/public" + user.avatar;
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }
      await user.destroy();
      return resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const getAllUserByRole = (roleId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!roleId) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let listUser = await db.User.findAll({
        where: {
          roleId: roleId,
        },
      });
      return resolve({
        errCode: 0,
        listUser,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

module.exports = {
  createNewUser,
  searchUser,
  login,
  editUserById,
  deleteUserById,
  getAllUserByRole,
};
