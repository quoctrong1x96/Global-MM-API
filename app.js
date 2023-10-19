var express = require("express");
require("dotenv").config();
var logger = require("morgan");
var path = require("path");
var apiResponse = require("./helpers/apiResponse");
var addressRouter = require("./routes/address");
var typeRouter = require("./routes/type");
var indexRouter = require("./routes/index");
var swaggerUi = require("swagger-ui-express");
var swaggerJSDoc = require("swagger-jsdoc");
var swaggerDefinition = require("./helpers/swaggerDefine");

//Connect to MongoDB
var MONGODB_URL = process.env.MONGODB_URL;
var mongoose = require("mongoose");

var app = express();

//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}

//App express config
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public/uploads")));

//App set views
app.set("views", path.join(__dirname, "public", "views"));
app.set("view engine", "ejs");

//App set Route prefixes
app.use("/", indexRouter);
app.use("/api/address", addressRouter);
app.use("/api/type", typeRouter);

//App Config swagger for API
const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], // Thay thế 'app.js' bằng đường dẫn đến tệp chứa các chú thích Swagger
};
const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//App throw 404 if URL not found
app.all("*", function (req, res) {
  return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
  if (err.name == "UnathorizedError") {
    return apiResponse.unauthorizedResponse(res, err.message);
  }
});

mongoose
  .connect(MONGODB_URL, {})
  .then(() => {
    //don't show this LOGS when it is test
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to %s", MONGODB_URL);
      console.log("App is running ....");
      console.log("Press CTRL + C to stop process. \n");
    }
  })
  .catch((err) => {
    console.log("App starting with error: ", err.message);
    process.exit(1);
  });

var db = mongoose.connection;

module.exports = app;
