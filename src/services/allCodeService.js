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
        order: [["keyMap", "ASC"]],
      });

      return resolve({
        errCode: 0,
        listCode,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const getAllPhotoByObject = (objectId, idMap) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!objectId || !idMap) {
        return resolve({
          errCode: 1,
          errMessage: "Thiếu thông tin bắt buộc",
        });
      }

      let listPhoto = await db.Image.findAll({
        where: {
          objectId: objectId,
          idMap: idMap,
        },
        order: [["id", "ASC"]],
      });

      return resolve({
        errCode: 0,
        listPhoto,
      });
    } catch (e) {
      return reject(e);
    }
  });
};

module.exports = {
  getAllCode,
  getAllPhotoByObject,
};
