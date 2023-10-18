var express = require("express");
const AddressController = require('../controllers/addressController');
const multer = require('multer');
var router = express.Router();

//Multer config to destinaton folder
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/excel/'); // Thư mục đích để lưu tệp
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Tên tệp sẽ giữ nguyên tên gốc
    },
  });
  
  const upload = multer({ storage: storage });

//router

/**
 * @swagger
 * /api/address/country/add-excel:
 *   post:
 *     summary: Insert country data from excel
 *     responses:
 *       200:
 *         description: count of list success
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: Meo Meo
 *               - id: 2
 *                 name: Gau Gau
 */
router.post('/country/add-excel', upload.single('file'),AddressController.addCountryFromExcel);

module.exports = router;
