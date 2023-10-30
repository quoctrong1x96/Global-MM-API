// import xlsx from 'xlsx';
// import fs from 'fs';

// import logger from'../helpers/loggerWinston.js';
// import apiResponse from '../handlers/apiResponse.js';
// import crudController from './crudController/index.js';

// let TypeMethod = crudController('Country');
// //TODO Create condition
//       /**
//        * { field: { $gt: value } }
//        * $eq: So sánh bằng (Equal)
//        * $gt: So sánh lớn hơn (Greater Than).
//        * $lt: So sánh nhỏ hơn (Less Than).
//        * $gte: So sánh lớn hơn hoặc bằng (Greater Than or Equal).
//        * $lte: So sánh nhỏ hơn hoặc bằng (Less Than or Equal).
//        * $gte: So sánh lớn hơn hoặc bằng (Greater Than or Equal).
//        */


// TypeMethod.addCountryFromExcel = [
//   async (req, res) => {
//     try {
//       logger.info('Function: addCountryFromExcel');
//       if (!req.file) {
//         return apiResponse.validationErrorResponse(res, 'No file uploaded');
//       }
//       const filePath = req.file.path;
//       const workbook = xlsx.readFile(filePath);
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const data = xlsx.utils.sheet_to_json(worksheet);

//       //Define column index for data
//       const postalCodeIndex = 'Postal code';
//       const countryNameIndex = 'Tên quốc gia';

//       //Delete file when was read
//       fs.unlinkSync(filePath);

//       var errorSkip = 0; //Error skip counting
//       var errors = [];

//       for (const row of data) {
//         const countryName = row[countryNameIndex];
//         const postalCode = row[postalCodeIndex];

//         // Kiểm tra xem dữ liệu không rỗng và hợp lệ
//         if (!countryName || !postalCode) {
//           errors.push({ row, error: 'Missing data.' });
//           errorSkip++;
//           continue; // Bỏ qua dòng nếu dữ liệu không đầy đủ
//         }

//         if (!/^\d{5}$/.test(postalCode)) {
//           errors.push({ row, error: 'Wrong postal code.' });
//           errorSkip++;
//           continue; // Bỏ qua dòng nếu mã bưu điện không đúng định dạng
//         }

//         const country = new Country({
//           countryName: countryName,
//           postalCode: postalCode,
//         });

//         //Check duplicate
//         await Country.findOne({ countryName: countryName }).then((countryFinded) => {
//           // If data exist
//           logger.info(errorSkip + ' và ' + countryFinded);
//           if (countryFinded) {
//             errors.push({ row, error: 'Data is already exist' });
//             errorSkip++;
//           } else if(errorSkip == 0){// Insert
//             try {
//               country.save();
//             } catch (error) {
//               // Thêm mã lỗi và thông báo lỗi vào một mảng để sau này thông báo cho người dùng
//               errors.push({ row, error });
//             }
//           }
//         });
//       }
//       if (errors.length > 0) {
//         logger.error(errors);
//         return apiResponse.validationErrorResponse(
//           res,
//           'Data from Excel not good.',
//           errors
//         );
//       } else {
//         logger.info('Data added from Excel successfully');
//         res.json({ message: 'Data added from Excel successfully' });
//       }
//     } catch (error) {
//       logger.error(errors);
//       res
//         .status(500)
//         .json({ message: 'Error when server adding data from Excel' });
//     }
//   },
// ];

// export default TypeMethod;
