import express from "express";
import {
  uploadUser,
  uploadRestaurant,
  uploadDish,
  uploadHandbook,
} from "../middleware/multerMiddleware";
import userController from "../controllers/userController";
import allCodeController from "../controllers/allCodeController";
import restaurantController from "../controllers/restaurantController";
import dishController from "../controllers/dishController";
import customerController from "../controllers/customerController";
import handbookController from "../controllers/handbookController";

const router = express.Router();

const initWebRoutes = (app) => {
  //login
  router.post("/api/login", userController.handleLogin);

  //allCode
  router.get("/api/allcodes/:code", allCodeController.handleGetAllCode);
  router.get(
    "/api/photos/:objectId/:idMap",
    allCodeController.handleGetAllPhotoByObject
  );
  router.get("/api/paypal/config", allCodeController.handleGetPaypalConfig);

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
  router.post("/api/forgot", customerController.handleForgotPassword);
  router.put(
    "/api/forgot/:customerId",
    customerController.handleUpdatePassword
  );

  //restaurant
  router.get(
    "/api/restaurants/:restaurantId",
    restaurantController.handleGetRestaurantById
  );
  router.post(
    "/api/restaurants/search",
    restaurantController.handleSearchRestaurant
  );
  router.post(
    "/api/restaurants",
    uploadRestaurant.array("images"),
    restaurantController.handleCreateNewRestaurant
  );
  router.put(
    "/api/restaurants/:restaurantId",
    uploadRestaurant.array("images"),
    restaurantController.handleEditRestaurantById
  );
  router.delete(
    "/api/restaurants/:restaurantId",
    restaurantController.handleDeleteRestaurantById
  );

  //schedule
  router.post("/api/schedules", restaurantController.handleBulkCreateSchedule);
  router.post(
    "/api/schedules/search",
    restaurantController.handleSearchScheduleByDate
  );

  //dish
  router.post(
    "/api/dishes",
    uploadDish.array("images"),
    dishController.handleCreateNewDish
  );
  router.post("/api/dishes/search", dishController.handleSearchDish);
  router.put(
    "/api/dishes/:dishId",
    uploadDish.array("images"),
    dishController.handleEditDishById
  );
  router.delete("/api/dishes/:dishId", dishController.handleDeleteDishById);

  //booking
  router.post("/api/bookings", customerController.handleBookingTable);
  router.get(
    "/api/bookings/check",
    customerController.handleCheckExistBookByToken
  );
  router.put(
    "/api/bookings/verify",
    customerController.handleVerifyBookingTable
  );
  router.post("/api/bookings/search", restaurantController.handleSearchBooking);
  router.put(
    "/api/bookings/confirm/:bookingId",
    restaurantController.handleConfirmBookingTable
  );
  router.put(
    "/api/bookings/done/:bookingId",
    restaurantController.handleDoneBookingTable
  );
  router.delete(
    "/api/bookings/:bookingId",
    restaurantController.handleDeleteBookingById
  );

  //handbook
  router.get(
    "/api/handbooks/:handbookId",
    handbookController.handleGetHandbookById
  );
  router.post("/api/handbooks/search", handbookController.handleSearchHandbook);
  router.post(
    "/api/handbooks",
    uploadHandbook.single("avatar"),
    handbookController.handleCreateNewHandbook
  );
  router.put(
    "/api/handbooks/:handbookId",
    uploadHandbook.single("avatar"),
    handbookController.handleEditHandbookById
  );
  router.delete(
    "/api/handbooks/:handbookId",
    handbookController.handleDeleteHandbookById
  );

  //review
  router.get(
    "/api/reviews/:restaurantId/:customerId",
    restaurantController.handleGetReviewByCustomerAndRestaurant
  );
  router.post(
    "/api/reviews/search",
    restaurantController.handleSearchReviewByRestaurant
  );
  router.post("/api/reviews", restaurantController.handleAddNewReview);
  router.put(
    "/api/reviews/:reviewId",
    restaurantController.handleEditReviewById
  );
  router.get(
    "/api/score/:restaurantId",
    restaurantController.handleGetListScoreByRestaurant
  );

  return app.use("/", router);
};

module.exports = initWebRoutes;
