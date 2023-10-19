const Type = require("../models/typeModel");
const apiResponse = require("../helpers/apiResponse");
const { body, validatonResult } = require("express-validator");
const xlsx = require("xlsx");
const { sanitizeBody } = require("express-validator");
const auth = require("../middlewares/jwt");
const fs = require("fs");
const logger = require("../helpers/loggerWinston");
const { default: mongoose } = require("mongoose");

//Convert type Schema
function TypeData(data) {
  (this._id = data.id),
    (this.code = data.code),
    (this.name = data.name),
    (this.value = data.value),
    (this.parentId = data.ParentId);
}

/**
 * Find List type by condition
 */
exports.typeList = [
  function (req, res) {
    try {
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
 * Create new Type data
 *
 * @param {string}  name type name
 * @param {string}  value type value
 * @param {string}  parentId type Parent id
 */
exports.typeStore = [
  body("name", "Type name must not be empty")
    .isLength({ min: 1 })
    .trim()
    .custom((value, { req }) => {
      return Type.findOne({ name: value }).then((type) => {
        if (type) {
          return Promise.reject("Type already exist with this name");
        }
      });
    }),
  //   sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errorValidate = validatonResult(req);
      var type = new Country({
        name: req.body.name,
        value: req.body.value ? req.body.value : "",
      });
      if (!errorValidate.isEmpty()) {
        return apiResponse.validationErrorResponse(
          res,
          "Validation error",
          errorValidate.array()
        );
      } else {
        //Save Type
        type.save(function (err) {
          if (err) {
            return apiResponse.errorResponse(res, err);
          }
          let typeData = new CountryData(type);
          return apiResponse.successResponseWithData(
            res,
            "Country add success",
            typeData
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
 * Update Type by ID
 *
 * @param {string}  id ID of Type
 * @param {string}  name Type name
 * @param {string}  value Value of Type
 * @param {string}  parentId ID of parent type
 */
exports.typeUpdate = [
  body("name", "Type name must not be empty")
    .isLength({ min: 1 })
    .trim()
    .custom((value, { req }) => {
      return Type.findOne({ _id: req.params.id }).then((country) => {
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

exports.addTypeFromExcel = [
  async (req, res) => {
    try {
      logger.info("Function: addTypeFromExcel");
      if (!req.file) {
        return apiResponse.validationErrorResponse(res, "No file uploaded");
      }
      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet);

      //Define column index for data
      const valueIndex = "Giá trị";
      const nameIndex = "Tên";
      const codeIndex = "Mã";
      const codeParentIndex = "Mã cha";

      //Delete file when was read
      fs.unlinkSync(filePath);

      var errorSkip = 0; //Error skip counting
      var errors = [];

      for (const row of data) {
        const typeName = row[nameIndex];
        const typeCode = row[codeIndex];

        // Kiểm tra xem dữ liệu không rỗng và hợp lệ
        if (!typeName || !typeCode) {
          errors.push({ row, error: "Name or Code of Type must be not null" });
          errorSkip++;
          continue; // Bỏ qua dòng nếu dữ liệu không đầy đủ
        }

        //Check duplicate
        await Type.findOne({ code: typeCode }).then((typeFound) => {
          if (typeFound) {
            errors.push({ row, error: "Data is already exist" });
            errorSkip++;
          }
        });
      }
      if (errors.length > 0) {
        logger.error(errors);
        return apiResponse.validationErrorResponse(
          res,
          "Data from Excel not good.",
          errors
        );
      } else {
        //Begin MongoDB session
        const session = mongoose.startSession();

        try {
          //Loop data
          var index = 0;
          for (const row of data) {
            logger.error(index++);
            //Get data from row
            const typeName = row[nameIndex];
            const typeCode = row[codeIndex];
            const typeValue = row[valueIndex];
            const typeParent = row[codeParentIndex];
            var typeParentId = "0";

            //Check parentID if value not 0 or null
            if (typeParent != null && typeParent != "0" && typeParent != 0) {
              const parentExists = await Type.exists({
                code: typeCode,
              });
              if (parentExists) {
                typeParentId = parentExists._id;
              } else {
                errors.push({ row, error: "Mã cha not exist" });
                logger.error("Mã cha không tồn tại");
                continue;
              }
            }

            //Create new rowdata
            var type = new Type({
              name: typeName,
              code: typeCode,
              parentId: typeParent,
              value: typeParentId,
            });

            //Save data
            await type.save();
          }
          logger.info("Errors: " + errors.length);
          //If errors has, then skip save, because we only insert all or rollback all
          if (errors.length == 0) {
            //Comit session of MongoDB connect
            (await session).commitTransaction;
            logger.info("Data added from Excel successfully");
            //Return response with message success
            res.json({ message: "Data added from Excel successfully" });
          } else {
            //Rollback all session
            (await session).abortTransaction;
            return apiResponse.validationErrorResponse(
              res,
              "Data from Excel not good.",
              errors
            );
          }
        } catch (error) {
          logger.error(error.message);
          errors.push({ row, error });
          (await session).abortTransaction;
          return apiResponse.validationErrorResponse(
            res,
            "Data from Excel not good.",
            errors
          );
        } finally {
          (await session).endSession;
        }
      }
    } catch (error) {
      logger.error(error.message);
      res
        .status(500)
        .json({ message: "Error when server adding data from Excel" });
    }
  },
];
