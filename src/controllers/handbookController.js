import handbookService from "../services/handbookService";

const handleCreateNewHandbook = async (req, res) => {
  try {
    const response = await handbookService.createNewHandbook(
      req.body,
      req.file,
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

const handleSearchHandbook = async (req, res) => {
  try {
    const response = await handbookService.searchHandbook(req.body);

    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleEditHandbookById = async (req, res) => {
  try {
    const response = await handbookService.editHandbookById(
      req.params.handbookId,
      req.body,
      req.file,
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

const handleDeleteHandbookById = async (req, res) => {
  try {
    const response = await handbookService.deleteHandbookById(
      req.params.handbookId
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleGetHandbookById = async (req, res) => {
  try {
    const response = await handbookService.getHandbookById(
      req.params.handbookId
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
  handleCreateNewHandbook,
  handleSearchHandbook,
  handleEditHandbookById,
  handleDeleteHandbookById,
  handleGetHandbookById,
};
