import { body, validationResult } from 'express-validator';
import xlsx from 'xlsx';
import fs from 'fs';

import Type from '../models/typeModel.js';
import apiResponse from '../handlers/apiResponse.js';
import logger from '../helpers/loggerWinston.js';
import isExtention from '../helpers/checkFileExtention.js';
import crudController from './crudController/index.js';

var typeMethod = crudController('Type');
/**
 * This function is used to insert a list of data in Type Model format
 * into the database using a mechanism that only inserts correct data.
 *  It then returns a message indicating the rows that were correctly
 * inserted and the data that has errors.
 * - First: Check Authorized
 * - Check validate parameter
 * - Process: Insert new row and record error row
 *
 * @param {Request} req Http Request
 * @param {Response} res Http Response
 * @returns {Response} Return an Http Response with:
 * - Message: Report the number of rows inserted and the number of rows not inserted.
 * - Data: Provide a list of rows in the order of successful or unsuccessful
 *  insertion along with their corresponding messages
 */
typeMethod.importFromExcel = [
  // Kiểm tra xem trường 'file' đã được gửi trong yêu cầu hay chưa
  body('file').isEmpty().withMessage('File not found in your request'),
  // Kiểm tra xem tệp gửi lên có phải là tệp Excel hay không
  body('file').custom((value, { req }) => {
    const isExcelResult = isExtention.isExcel(req.file);
    if (isExcelResult === 1) {
      throw new Error('Your file is not Excel file');
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
      const valueIndex = 'Giá trị';
      const nameIndex = 'Tên';
      const codeIndex = 'Mã';
      const codeParentIndex = 'Mã cha';

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
        let typeParentId = '0';

        // Check required data
        if (!typeName || !typeCode) {
          msg.push('Name or Code of Type must be not null');
        }

        //Check parentID if value not 0 or null
        if (typeParent != null && typeParent != '0' && typeParent != 0) {
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
          msg.push('Data is already exist');
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
          msgArray.push({ row: i, success: 'Data insert successfuly' });
        } else {
          msgArray.push({ row: i, errors: msg.toString() });
        }
      }
      if (countRowSuccess > 0) {
        return apiResponse.successResponseWithData(
          res,
          'Insert susscess: ' +
            countRowSuccess +
            ' rows, \nInsert fairule ' +
            (data.length - countRowSuccess) +
            'rows',
          msgArray
        );
      } else {
        return apiResponse.validationErrorResponse(
          res,
          'Insert fairule ' + data.length + ' rows',
          msgArray
        );
      }

      // if (errors.length > 0) {
      //   return apiResponse.validationErrorResponse(res,'Data from Excel not good.',errors);
      // } else {
      // Step 1: Start a Client Session
      // const session = await mongoose.startSession();
      // session.startTransaction();
      // try {
      // // Perform operations within the transaction
      // const type = Type({
      //   name: 'typeName',
      //   code: 'typeCode',
      //   parentId: 'typeParentId',
      //   value: 'typeValue',
      // });
      // await type.save();
      // Commit the transaction
      // await session.abortTransaction();
      // console.log('Transaction committed successfully.';
      // } catch (error) {
      //   console.error('Error occurred in the transaction:', error);
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
      //     var typeParentId = '0';
      //     //Check parentID if value not 0 or null
      //     if (typeParent != null && typeParent != '0' && typeParent != 0) {
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
      //         errors.push({ row: index, error: 'Mã cha not exist' });
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
      //       'Data from Excel not good.',
      //       errors
      //     );
      //   } else {
      //     //Commit transaction
      //     await session.commitTransaction();
      //     //Return response with message success
      //     res.json({ message: 'Data added from Excel successfully' });
      //   }
      // } catch (error) {
      //   //Catch errors and abort Transaction
      //   logger.error(error.message);
      //   errors.push({ error });
      //   // (await session).abortTransaction();
      //   return apiResponse.validationErrorResponse(
      //     res,
      //     'Data from Excel not good.',
      //     errors
      //   );
      // } finally {
      //   await session.endSession();
      // }
      // }
      //         logger.info('Errors: ' + errors.length);
      //         //If errors has, then skip save, because we only insert all or rollback all
      //         if (errors.length == 0) {
      //           //Comit session of MongoDB connect
      //           (await session).commitTransaction;
      //           logger.info('Data added from Excel successfully';
      //           //Return response with message success
      //           res.json({ message: 'Data added from Excel successfully' });
      //         } else {
      //           //Rollback all session
      //           (await session).abortTransaction;
      //           return apiResponse.validationErrorResponse(
      //             res,
      //             'Data from Excel not good.',
      //             errors
      //           );
      //         }
      //       }
    } catch (error) {
      logger.error(error.message);
      return apiResponse.serverErrorResponse(res, msgArray);
    }
  },
];

export default typeMethod;