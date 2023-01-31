import express from "express";
import bodyParser from "body-parser";
import configStaticFile from "./config/staticFile";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
require("dotenv").config();

let app = express();
let port = process.env.PORT || 1229;

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", process.env.URL_REACT);

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

// config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//setup view engine
configStaticFile(app);

//init web route
initWebRoutes(app);

connectDB(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
