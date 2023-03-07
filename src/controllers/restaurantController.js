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

module.exports = {
  handleCreateNewRestaurant,
  handleSearchRestaurant,
  handleEditRestaurantById,
};
