import customerService from "../services/customerService";

const handleBookingTable = async (req, res) => {
  try {
    let response = await customerService.bookingTable(req.body);

    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleVerifyBookingTable = async (req, res) => {
  try {
    let response = await customerService.verifyBookingTable(req.query.token);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

module.exports = {
  handleBookingTable,
  handleVerifyBookingTable,
};
