import express from "express";
import bodyParser from "body-parser";
import configStaticFile from "./config/staticFile";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
require("dotenv").config();

let app = express();
let port = process.env.PORT || 1229;

//cors
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", process.env.URL_REACT);

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

configStaticFile(app);

initWebRoutes(app);

connectDB(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
