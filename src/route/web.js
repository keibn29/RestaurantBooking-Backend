import express from "express";
import { upload } from "../middleware/multerMiddleware";
import userController from "../controllers/userController";

const router = express.Router();

const initWebRoutes = (app) => {
  router.post("/api/login", userController.handleLogin);

  router.get("/api/allcodes/:code", userController.handleGetAllCode);

  router.post("/api/users/search", userController.handleSearchUser);
  router.post(
    "/api/users",
    upload.single("avatar"),
    userController.handleCreateNewUser
  );

  return app.use("/", router);
};

module.exports = initWebRoutes;
