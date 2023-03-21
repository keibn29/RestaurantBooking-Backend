import express from "express";
import {
  uploadUser,
  uploadRestaurant,
  uploadDish,
} from "../middleware/multerMiddleware";
import userController from "../controllers/userController";
import allCodeController from "../controllers/allCodeController";
import restaurantController from "../controllers/restaurantController";
import dishController from "../controllers/dishController";
import customerController from "../controllers/customerController";

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
  router.delete(
    "/api/restaurants/:restaurantId",
    restaurantController.handleDeleteRestaurantById
  );

  //schedule
  router.post("/api/schedules", restaurantController.handleBulkCreateSchedule);
  router.get("/api/schedules", restaurantController.handleSearchScheduleByDate);

  //dish
  router.post(
    "/api/dishes",
    uploadDish.single("avatar"),
    dishController.handleCreateNewDish
  );
  router.post("/api/dishes/search", dishController.handleSearchDish);
  router.put(
    "/api/dishes/:dishId",
    uploadDish.single("avatar"),
    dishController.handleEditDishById
  );
  router.delete("/api/dishes/:dishId", dishController.handleDeleteDishById);

  //booking
  router.post("/api/bookings", customerController.handleBookingTable);
  router.put(
    "/api/bookings/verify",
    customerController.handleVerifyBookingTable
  );
  router.post("/api/bookings/search", restaurantController.handleSearchBooking);
  router.put(
    "/api/bookings/confirm/:bookingId",
    restaurantController.handleConfirmBookingTable
  );
  router.delete(
    "/api/bookings/:bookingId",
    restaurantController.handleDeleteBookingById
  );

  return app.use("/", router);
};

module.exports = initWebRoutes;
