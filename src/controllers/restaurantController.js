import restaurantService from "../services/restaurantService";

const handleSearchRestaurant = async (req, res) => {
  try {
    const response = await restaurantService.searchRestaurant(
      req.body,
      req.query.language
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

const handleCreateNewRestaurant = async (req, res) => {
  try {
    const response = await restaurantService.createNewRestaurant(
      req.body,
      req.files,
      req.fileValidationError
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

const handleEditRestaurantById = async (req, res) => {
  try {
    const response = await restaurantService.editRestaurantById(
      req.params.restaurantId,
      req.body,
      req.files,
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
    const response = await restaurantService.deleteRestaurantById(
      req.params.restaurantId
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

let handleBulkCreateSchedule = async (req, res) => {
  try {
    const response = await restaurantService.bulkCreateSchedule(req.body);

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
    const response = await restaurantService.searchScheduleByDate(req.body);

    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleSearchBooking = async (req, res) => {
  try {
    const response = await restaurantService.searchBooking(req.body);

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
    const response = await restaurantService.confirmBookingTable(
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

const handleDoneBookingTable = async (req, res) => {
  try {
    const response = await restaurantService.doneBookingTable(
      req.params.bookingId,
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

const handleDeleteBookingById = async (req, res) => {
  try {
    const response = await restaurantService.deleteBookingById(
      req.params.bookingId
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

const handleGetRestaurantById = async (req, res) => {
  try {
    const response = await restaurantService.getRestaurantById(
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

const handleSearchReviewByRestaurant = async (req, res) => {
  try {
    const response = await restaurantService.searchReviewByRestaurant(req.body);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleAddNewReview = async (req, res) => {
  try {
    const response = await restaurantService.addNewReview(req.body);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleEditReviewById = async (req, res) => {
  try {
    const response = await restaurantService.editReviewById(
      req.params.reviewId,
      req.body
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleGetReviewByCustomerAndRestaurant = async (req, res) => {
  try {
    const response = await restaurantService.getReviewByCustomerAndRestaurant(
      req.params.restaurantId,
      req.params.customerId
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

const handleGetListScoreByRestaurant = async (req, res) => {
  try {
    const response = await restaurantService.getListScoreByRestaurant(
      req.params.restaurantId
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
  handleCreateNewRestaurant,
  handleSearchRestaurant,
  handleEditRestaurantById,
  handleDeleteRestaurantById,
  handleBulkCreateSchedule,
  handleSearchScheduleByDate,
  handleSearchBooking,
  handleConfirmBookingTable,
  handleDoneBookingTable,
  handleDeleteBookingById,
  handleGetRestaurantById,
  handleAddNewReview,
  handleEditReviewById,
  handleSearchReviewByRestaurant,
  handleGetReviewByCustomerAndRestaurant,
  handleGetListScoreByRestaurant,
};
