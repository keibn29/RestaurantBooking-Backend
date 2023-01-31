import express from "express";

let configStaticFile = (app) => {
  app.use(express.static("./src/public"));
};

module.exports = configStaticFile;
