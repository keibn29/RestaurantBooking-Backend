import allCodeService from "../services/allCodeService";

const handleGetAllCode = async (req, res) => {
  try {
    const response = await allCodeService.getAllCode(req.params.code);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleGetAllPhotoByObject = async (req, res) => {
  try {
    const response = await allCodeService.getAllPhotoByObject(
      req.params.objectId,
      req.params.idMap
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleGetPaypalConfig = async (req, res) => {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;

    return res.status(200).json({
      errCode: 0,
      clientId,
    });
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

module.exports = {
  handleGetAllCode,
  handleGetAllPhotoByObject,
  handleGetPaypalConfig,
};
