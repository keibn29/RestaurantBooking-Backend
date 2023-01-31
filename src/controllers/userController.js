import userService from "../services/userService";

const handleLogin = async (req, res) => {
  try {
    let userData = await userService.login(req.body);

    return res.status(200).json(userData);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleCreateNewUser = async (req, res) => {
  try {
    let message = await userService.createNewUser(
      req.body,
      req.file,
      req.fileValidationError
    );

    return res.status(200).json(message);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleSearchUser = async (req, res) => {
  try {
    let listUser = await userService.searchUser(req.body);

    return res.status(200).json(listUser);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server!",
    });
  }
};

const handleGetAllCode = async (req, res) => {
  try {
    let listCode = await userService.getAllCode(req.params.code);

    return res.status(200).json(listCode);
  } catch (e) {
    console.log(e);
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
  handleGetAllCode,
};
