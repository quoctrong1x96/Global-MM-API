const Country = require("../models/countryModel");
const apiResponse = require("../helpers/apiResponse");
const { body, validatonResult } = require("express-validator");
const xlsx = require("xlsx");
const { sanitizeBody } = require("express-validator");
const auth = require("../middlewares/jwt");


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
  (req, res) => {
    try {
      if (!req.file) {
        return apiResponse.errorResponse(res, "No file uploaded");
      }
      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet);

      //Delete file when was read
      fs.unlinkSync(filePath);

      for (const row of data) {
        // Kiểm tra xem dữ liệu không rỗng và hợp lệ
        if (!row.countryName || !row.postalCode) {
          console.error("Missing data. Skipping this row.");
          continue; // Bỏ qua dòng nếu dữ liệu không đầy đủ
        }

        if (!/^\d{5}$/.test(row.postalCode)) {
          console.error(
            `Invalid postal code: ${row.postalCode}. Skipping this row.`
          );
          continue; // Bỏ qua dòng nếu mã bưu điện không đúng định dạng
        }

        const country = new Country({
          countryName: row.countryName,
          postalCode: row.postalCode,
        });

        country.save((err) => {
          if (err) {
            console.error(err);
          }
        });
      }

      res.json({ message: "Data added from Excel successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding data from Excel" });
    }
  },
];
