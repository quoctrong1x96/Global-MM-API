var express = require("express");
require("dotenv").config();
var logger = require("morgan");
var path = require("path");
var apiResponse = require("./helpers/apiResponse");

//Connect to MongoDB
var MONGODB_URL = process.env.MONGODB_URL;
var mongoose = require("mongoose");
mongoose
  .connect(MONGODB_URL, {})
  .then(() => {
    //don't show this LOGS when it is test
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to %S", MONGODB_URL);
      console.log("App is running ....");
      console.log("Press CTRL + C to stop process. \n");
    }
  })
  .catch((err) => {
    console.log("App starting with error: ", err.message);
    process.exit(1);
  });
var db = mongoose.connection;

var app = express();

//don't show the log when it is test
if(process.env.NODE_ENV !=="test"){
    app.use(logger("dev"));
}

//App express config
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public/uploads")));

//App set views
app.set("view",path.join(__dirname,"public/views"));

//App set Route prefixes


//App throw 404 if URL not found
app.all("*",function(req, res){
    return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res)=>{
    if(err.name == "UnathorizedError"){
        return apiResponse.unauthorizedResponse(res, err.message);
    }
});

module.exports = app;
