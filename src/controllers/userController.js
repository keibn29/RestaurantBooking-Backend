import userService from "../services/userService";

const handleLogin = async (req, res) => {
  try {
    const response = await userService.login(req.body);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleCreateNewUser = async (req, res) => {
  try {
    const response = await userService.createNewUser(
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

const handleSearchUser = async (req, res) => {
  try {
    const response = await userService.searchUser(req.body);

    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleEditUserById = async (req, res) => {
  try {
    const response = await userService.editUserById(
      req.params.userId,
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

const handleDeleteUserById = async (req, res) => {
  try {
    const response = await userService.deleteUserById(req.params.userId);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

module.exports = {
  handleCreateNewUser,
  handleSearchUser,
  handleLogin,
  handleEditUserById,
  handleDeleteUserById,
};
