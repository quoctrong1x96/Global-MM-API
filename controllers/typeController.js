const Type = require("../models/typeModel");
const apiResponse = require("../helpers/apiResponse");
const { body, validationResult } = require("express-validator");
const xlsx = require("xlsx");
const { sanitizeBody } = require("express-validator");
const auth = require("../middlewares/jwt");
const fs = require("fs");
const logger = require("../helpers/loggerWinston");
const { default: mongoose, mongo } = require("mongoose");
const mime = require("mime-types");
const { isExcel } = require("../helpers/checkFileExtention");
const { openTransaction } = require("../helpers/mongooseConfig");

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
  // Kiểm tra xem trường "file" đã được gửi trong yêu cầu hay chưa
  body("file").isEmpty().withMessage("File not found in your request"),
  // Kiểm tra xem tệp gửi lên có phải là tệp Excel hay không
  body("file").custom((value, { req }) => {
    const isExcelResult = isExcel(req.file);
    if (isExcelResult === 1) {
      throw new Error("Your file is not Excel file");
    }
    return true;
  }),
  async (req, res) => {
    try {
      // Get errors after checked by express-validator
      const reqErrors = validationResult(req);
      if (!reqErrors.isEmpty()) {
        return apiResponse.validationErrorResponse(res, reqErrors.array());
      }

      // Get data from excel (File in request form client) to Json
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

      var msgArray = []; //Errors array used to saving
      var countRowSuccess = 0; // Count row in sert susscessn
      //Check error for all data insert
      for (var i = 0; i < data.length; i++) {
        var msg = [];
        const row = data[i];
        // Get data each row
        const typeName = row[nameIndex];
        const typeCode = row[codeIndex];
        const typeValue = row[valueIndex];
        const typeParent = row[codeParentIndex];
        let typeParentId = "0";

        // Check required data
        if (!typeName || !typeCode) {
          msg.push("Name or Code of Type must be not null");
        }

        //Check parentID if value not 0 or null
        if (typeParent != null && typeParent != "0" && typeParent != 0) {
          const parentExists = await Type.findOne({ code: typeParent });
          if (parentExists) {
            typeParentId = parentExists._id;
          } else {
            msg.push('"Mã cha" not exist');
          }
        }

        //Check duplicate
        const isExist = await Type.findOne({ code: typeCode });
        if (isExist) {
          msg.push("Data is already exist");
        }
        //Create messsage by row
        if (msg.length == 0) {
          // Perform operations within the transaction
          const type = Type({
            name: typeName,
            code: typeCode,
            parentId: typeParentId,
            value: typeValue,
          });

          // Save data
          await type.save();
          countRowSuccess++;
          msgArray.push({ row: i, success: "Data insert successfuly" });
        } else {
          msgArray.push({ row: i, errors: msg.toString() });
        }
      }
      if (countRowSuccess > 0) {
        return apiResponse.successResponseWithData(
          res,
          "Insert susscess: " +
            countRowSuccess +
            " rows, \nInsert fairule " +
            (data.length - countRowSuccess) +
            "rows",
          msgArray
        );
      } else {
        return apiResponse.validationErrorResponse(
          res,
          "Insert fairule " + data.length + " rows",
          msgArray
        );
      }

      // if (errors.length > 0) {
      //   return apiResponse.validationErrorResponse(res,"Data from Excel not good.",errors);
      // } else {
      // Step 1: Start a Client Session
      // const session = await mongoose.startSession();
      // session.startTransaction();
      // try {
      // // Perform operations within the transaction
      // const type = Type({
      //   name: "typeName",
      //   code: "typeCode",
      //   parentId: "typeParentId",
      //   value: "typeValue",
      // });
      // await type.save();
      // Commit the transaction
      // await session.abortTransaction();
      // console.log("Transaction committed successfully.");
      // } catch (error) {
      //   console.error("Error occurred in the transaction:", error);
      //   session.abortTransaction();
      // }

      // const session = await openTransaction();

      // try {
      //   //Loop data
      //   var index = 0;
      //   for (const row of data) {
      //     //Get data from row
      //     const typeName =  row[nameIndex];
      //     const typeCode =  row[codeIndex];
      //     const typeValue =  row[valueIndex];
      //     const typeParent =  row[codeParentIndex];
      //     var typeParentId = "0";
      //     //Check parentID if value not 0 or null
      //     if (typeParent != null && typeParent != "0" && typeParent != 0) {
      //       const parentExists = await Type.exists(
      //         {
      //           code: typeCode,
      //         },
      //         null,
      //         { session: session }
      //       );
      //       console.dir(parentExists);
      //       if (parentExists) {
      //         typeParentId = parentExists._id;
      //       } else {
      //         errors.push({ row: index, error: "Mã cha not exist" });
      //       }
      //     }
      //     //Create new rowdata
      //     //Save data

      //     const type = Type({
      //       name: typeName,
      //       code: typeCode,
      //       parentId: typeParentId,
      //       value: typeValue
      //     });
      //     await type.save({session:session});
      //     // await Type.create(
      //     //   [{
      //     //     name: typeName,
      //     //     code: typeCode,
      //     //     parentId: typeParentId,
      //     //     value: typeValue,
      //     //   }],
      //     //   { session: session }
      //     // );
      //   }
      //   //Check list error after checking
      //   if (errors.length > 0) {
      //     //Abort Transaction
      //     await session.abortTransaction();
      //     return apiResponse.validationErrorResponse(
      //       res,
      //       "Data from Excel not good.",
      //       errors
      //     );
      //   } else {
      //     //Commit transaction
      //     await session.commitTransaction();
      //     //Return response with message success
      //     res.json({ message: "Data added from Excel successfully" });
      //   }
      // } catch (error) {
      //   //Catch errors and abort Transaction
      //   logger.error(error.message);
      //   errors.push({ error });
      //   // (await session).abortTransaction();
      //   return apiResponse.validationErrorResponse(
      //     res,
      //     "Data from Excel not good.",
      //     errors
      //   );
      // } finally {
      //   await session.endSession();
      // }
      // }
      //         logger.info("Errors: " + errors.length);
      //         //If errors has, then skip save, because we only insert all or rollback all
      //         if (errors.length == 0) {
      //           //Comit session of MongoDB connect
      //           (await session).commitTransaction;
      //           logger.info("Data added from Excel successfully");
      //           //Return response with message success
      //           res.json({ message: "Data added from Excel successfully" });
      //         } else {
      //           //Rollback all session
      //           (await session).abortTransaction;
      //           return apiResponse.validationErrorResponse(
      //             res,
      //             "Data from Excel not good.",
      //             errors
      //           );
      //         }
      //       }
    } catch (error) {
      logger.error(error.message);
      return apiResponse.errorResponse(res, msgArray);
    }
  },
];

async function insertArrayToMongoModelWithParentCode(
  array,
  parentCodes,
  Model,
  mongo
) {
  return new Promise(async (resolve, reject) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    //Create each row is Promise to save
    const promises = array.map((row, index) => {
      return new Promise(async (resolve, reject) => {
        try {
          //Check parentID if value not 0 or null
          if (
            parentCodes[index] != null &&
            parentCodes[index] != "0" &&
            parentCodes[index] != 0
          ) {
            const parentExists = await Model.exists(
              {
                code: parentCodes[index],
              },
              null,
              { session: session }
            );
            if (parentExists) {
              row.parentId = parentExists._id;
            } else {
              errors.push({ row, error: "Mã cha not exist" });
            }
          }
          await row.save({ session: session });
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });

    //Active all promise to save
    //If it is fail then rollback all, else commit all
    Promise.all(promises)
      .then(() => {
        session.commitTransaction((err) => {
          if (err) {
            session.abortTransaction();
            session.endSession();
            reject(err);
          } else {
            session.endSession();
            resolve("Data added from Excel successfully.");
          }
        });
      })
      .catch((error) => {
        session.abortTransaction((err) => {
          session.endSession();
          reject(error || err);
        });
      });
  });
}
