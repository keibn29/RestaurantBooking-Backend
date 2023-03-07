import db from "../models/index";
import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);
const { Op } = require("sequelize");
import fs from "fs";
import appRoot from "app-root-path";

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
      if (file) {
        fs.unlinkSync(file.path);
      }
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

      let user = await db.User.findOne({
        where: {
          id: userId,
        },
      });
      if (user) {
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

const deleteUserById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let user = await db.User.findOne({
        where: {
          id: userId,
        },
      });
      if (user) {
        if (user.avatar) {
          let avatarPath = appRoot + "/src/public" + user.avatar;
          if (fs.existsSync(avatarPath)) {
            fs.unlinkSync(avatarPath);
          }
        }
        await user.destroy();
        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      } else {
        resolve({
          errCode: 2,
          errMessage: "Không tìm thấy người dùng",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const getAllUserByRole = (roleId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!roleId) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let listUser = await db.User.findAll({
        where: {
          roleId: roleId,
        },
      });
      resolve({
        errCode: 0,
        listUser,
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
  editUserById,
  deleteUserById,
  getAllUserByRole,
};
