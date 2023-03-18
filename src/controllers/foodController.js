import foodService from "../services/foodService";

const handleCreateNewFood = async (req, res) => {
  try {
    let response = await foodService.createNewFood(
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

const handleSearchFood = async (req, res) => {
  try {
    let response = await foodService.searchFood(req.body, req.query.language);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleEditFoodById = async (req, res) => {
  try {
    let response = await foodService.editFoodById(
      req.params.foodId,
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

const handleDeleteFoodById = async (req, res) => {
  try {
    let response = await foodService.deleteFoodById(req.params.foodId);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

module.exports = {
  handleCreateNewFood,
  handleSearchFood,
  handleEditFoodById,
  handleDeleteFoodById,
};
