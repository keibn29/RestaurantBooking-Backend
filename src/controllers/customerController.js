import customerService from "../services/customerService";

const handleBookingTable = async (req, res) => {
  try {
    const response = await customerService.bookingTable(req.body);

    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleCheckExistBookByToken = async (req, res) => {
  try {
    const response = await customerService.checkExistBookByToken(
      req.query.token
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleVerifyBookingTable = async (req, res) => {
  try {
    const response = await customerService.verifyBookingTable(req.query.token);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleForgotPassword = async (req, res) => {
  try {
    const response = await customerService.forgotPassword(req.body);

    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleUpdatePassword = async (req, res) => {
  try {
    const response = await customerService.updatePassword(
      req.params.customerId,
      req.query.token,
      req.body
    );

    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

module.exports = {
  handleBookingTable,
  handleVerifyBookingTable,
  handleCheckExistBookByToken,
  handleForgotPassword,
  handleUpdatePassword,
};
