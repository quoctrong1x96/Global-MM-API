const Country = require("../models/countryModel");
const apiResponse = require("../helpers/apiResponse");
const { body, validatonResult } = require("express-validator");
const xlsx = require("xlsx");
const { sanitizeBody } = require("express-validator");
const auth = require("../middlewares/jwt");
const fs = require("fs");

//Convert Country Schema
function CountryData(data) {
  (this._id = data.id),
    (this.countryName = data.countryName),
    (this.postalCode = data.postalCode);
}

exports.countryList = [
  function (req, res) {
    try {
      //TODO Create condition
      /**
       * { field: { $gt: value } }
       * $eq: So sánh bằng (Equal)
       * $gt: So sánh lớn hơn (Greater Than).
       * $lt: So sánh nhỏ hơn (Less Than).
       * $gte: So sánh lớn hơn hoặc bằng (Greater Than or Equal).
       * $lte: So sánh nhỏ hơn hoặc bằng (Less Than or Equal).
       * $gte: So sánh lớn hơn hoặc bằng (Greater Than or Equal).
       */
      var condition = {};

      //Find data by condition
      Country.find({ condition }, (err, countries) => {
        if (err) {
          throw err;
        } else {
          if (countries.length > 0) {
            return apiResponse.successResponseWithData(
              res,
              "Operator success",
              countries
            );
          } else {
            return apiResponse.successResponseWithData(
              res,
              "Operator success",
              []
            );
          }
        }
      });
    } catch (err) {
      //throw error in json response with status 500
      return apiResponse.errorResponse(res, err);
    }
  },
];
/**
 * Create new Country data
 *
 * @param {string}  countryName Country name
 * @param {string}  postalCode optional
 */
exports.countryStore = [
  body("countryName", "Country name must not be empty")
    .isLength({ min: 1 })
    .trim()
    .custom((value, { req }) => {
      return Country.findOne({ countryName: value }).then((country) => {
        if (country) {
          return Promise.reject("Country already exist with this name");
        }
      });
    }),
  //   sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errorValidate = validatonResult(req);
      var country = new Country({
        countryName: req.body.countryName,
        postalCode: req.body.postalCode ? req.body.postalCode : "",
      });
      if (!errorValidate.isEmpty()) {
        return apiResponse.validationErrorResponse(
          res,
          "Validation error",
          errorValidate.array()
        );
      } else {
        //Save country
        country.save(function (err) {
          if (err) {
            return apiResponse.errorResponse(res, err);
          }
          let countryData = new CountryData(country);
          return apiResponse.successResponseWithData(
            res,
            "Country add success",
            countryData
          );
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.errorResponse(res, err);
    }
  },
];

/**
 * Update Country by ID
 *
 * @param {string}  id ID of country
 * @param {string}  countryName Country name
 * @param {string}  postalCode optional
 */
exports.countryUpdate = [
  body("countryName", "Country name must not be empty")
    .isLength({ min: 1 })
    .trim()
    .custom((value, { req }) => {
      return Country.findOne({ _id: req.params.countryId }).then((country) => {
        if (!country) {
          return Promise.reject("Country have not exist with this name yet");
        }
      });
    }),
  //   sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errorValidate = validatonResult(req);
      var country = new Country({
        _id: req.body.id,
        countryName: req.body.countryName,
        postalCode: req.body.postalCode ? req.body.postalCode : "",
      });
      if (!errorValidate.isEmpty()) {
        return apiResponse.validationErrorResponse(
          res,
          "Validation error",
          errorValidate.array()
        );
      } else {
        //Save country
        country.save(function (err) {
          if (err) {
            return apiResponse.errorResponse(res, err);
          }
          let countryData = new CountryData(country);
          return apiResponse.successResponseWithData(
            res,
            "Country add success",
            countryData
          );
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.errorResponse(res, err);
    }
  },
];

exports.addCountryFromExcel = [
  async (req, res) => {
    try {
      if (!req.file) {
        return apiResponse.validationErrorResponse(res, "No file uploaded");
      }
      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet);

      //Define column index for data
      const postalCodeIndex = "Postal code";
      const countryNameIndex = "Tên quốc gia";

      //Delete file when was read
      fs.unlinkSync(filePath);

      var errorSkip = 0; //Error skip counting
      var errors = [];

      for (const row of data) {
        const countryName = row[countryNameIndex];
        const postalCode = row[postalCodeIndex];
        // Kiểm tra xem dữ liệu không rỗng và hợp lệ
        if (!countryName || !postalCode) {
          errors.push({ row, error: "Missing data." });
          errorSkip++;
          continue; // Bỏ qua dòng nếu dữ liệu không đầy đủ
        }

        if (!/^\d{5}$/.test(postalCode)) {
          console.error(`Wrong Postal Code`);
          errorSkip++;
          continue; // Bỏ qua dòng nếu mã bưu điện không đúng định dạng
        }

        const country = new Country({
          countryName: countryName,
          postalCode: postalCode,
        });

        //Check duplicate
        await Country.findOne({ countryName: countryName }).then((countryFinded) => {
          // If data exist
          if (countryFinded) {
            errors.push({ row, error: "Data is already exist" });
            errorSkip++;
          } else if(errorSkip = 0){// Insert
            try {
              country.save();
              console.log("Saved: " + country);
            } catch (error) {
              console.error(
                `Error saving data for row: ${JSON.stringify(row)}`
              );
              // console.error(error);
              // Thêm mã lỗi và thông báo lỗi vào một mảng để sau này thông báo cho người dùng
              errors.push({ row, error });
            }
          }
        });
      }
      if (errors.length > 0) {
        return apiResponse.validationErrorResponse(
          res,
          "Data from Excel not good.",
          errors
        );
      } else {
        res.json({ message: "Data added from Excel successfully" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error when server adding data from Excel" });
    }
  },
];
