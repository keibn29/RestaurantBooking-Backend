import db from "../models/index";

const getAllCode = (code) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!code) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }
      let listCode = await db.Allcode.findAll({
        where: {
          type: code,
        },
        order: [["id", "ASC"]],
      });
      return resolve({
        errCode: 0,
        listCode: listCode,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

module.exports = {
  getAllCode,
};
