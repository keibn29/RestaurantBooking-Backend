import express from "express";
import { uploadUser, uploadRestaurant } from "../middleware/multerMiddleware";
import userController from "../controllers/userController";
import allCodeController from "../controllers/allCodeController";
import restaurantController from "../controllers/restaurantController";

const router = express.Router();

const initWebRoutes = (app) => {
  //login
  router.post("/api/login", userController.handleLogin);

  //allCode
  router.get("/api/allcodes/:code", allCodeController.handleGetAllCode);

  //user
  router.post("/api/users/search", userController.handleSearchUser);
  router.post(
    "/api/users",
    uploadUser.single("avatar"),
    userController.handleCreateNewUser
  );
  router.put(
    "/api/users/:userId",
    uploadUser.single("avatar"),
    userController.handleEditUserById
  );
  router.delete("/api/users/:userId", userController.handleDeleteUserById);
  router.get("/api/users/:role", userController.handleGetAllUserByRole);

  //restaurant
  router.post(
    "/api/restaurants/search",
    restaurantController.handleSearchRestaurant
  );
  router.post(
    "/api/restaurants",
    uploadRestaurant.single("avatar"),
    restaurantController.handleCreateNewRestaurant
  );
  router.put(
    "/api/restaurants/:restaurantId",
    uploadRestaurant.single("avatar"),
    restaurantController.handleEditRestaurantById
  );

  return app.use("/", router);
};

module.exports = initWebRoutes;
