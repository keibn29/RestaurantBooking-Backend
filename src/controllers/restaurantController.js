import restaurantService from "../services/restaurantService";

const handleSearchRestaurant = async (req, res) => {
  try {
    let response = await restaurantService.searchRestaurant(
      req.body,
      req.query.language
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleCreateNewRestaurant = async (req, res) => {
  try {
    let response = await restaurantService.createNewRestaurant(
      req.body,
      req.file,
      req.fileValidationError
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleEditRestaurantById = async (req, res) => {
  try {
    let response = await restaurantService.editRestaurantById(
      req.params.restaurantId,
      req.body,
      req.file,
      req.fileValidationError
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleDeleteRestaurantById = async (req, res) => {
  try {
    let response = await restaurantService.deleteRestaurantById(
      req.params.restaurantId
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

let handleBulkCreateSchedule = async (req, res) => {
  try {
    let response = await restaurantService.bulkCreateSchedule(req.body);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleSearchScheduleByDate = async (req, res) => {
  try {
    let response = await restaurantService.searchScheduleByDate(
      req.query.restaurantId,
      req.query.date
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleSearchBooking = async (req, res) => {
  try {
    let response = await restaurantService.searchBooking(req.body);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleConfirmBookingTable = async (req, res) => {
  try {
    let response = await restaurantService.confirmBookingTable(
      req.params.bookingId,
      req.query.statusId
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleDeleteBookingById = async (req, res) => {
  try {
    let response = await restaurantService.deleteBookingById(
      req.params.bookingId
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

module.exports = {
  handleCreateNewRestaurant,
  handleSearchRestaurant,
  handleEditRestaurantById,
  handleDeleteRestaurantById,
  handleBulkCreateSchedule,
  handleSearchScheduleByDate,
  handleSearchBooking,
  handleConfirmBookingTable,
  handleDeleteBookingById,
};
