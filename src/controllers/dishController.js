import dishService from "../services/dishService";

const handleCreateNewDish = async (req, res) => {
  try {
    let response = await dishService.createNewDish(
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

const handleSearchDish = async (req, res) => {
  try {
    let response = await dishService.searchDish(req.body, req.query.language);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleEditDishById = async (req, res) => {
  try {
    let response = await dishService.editDishById(
      req.params.dishId,
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

const handleDeleteDishById = async (req, res) => {
  try {
    let response = await dishService.deleteDishById(req.params.dishId);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

module.exports = {
  handleCreateNewDish,
  handleSearchDish,
  handleEditDishById,
  handleDeleteDishById,
};
