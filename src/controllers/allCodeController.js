import allCodeService from "../services/allCodeService";

const handleGetAllCode = async (req, res) => {
  try {
    let response = await allCodeService.getAllCode(req.params.code);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

module.exports = {
  handleGetAllCode,
};
