var express = require("express");
const AddressController = require('../controllers/addressController');
const multer = require('multer');
var router = express.Router();

//Multer config to destinaton folder
const upload = multer({dest: "uploads/excel/"});

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
router.post('/country/add-excel', upload.single('excelFile'),AddressController.addCountryFromExcel);

module.exports = router;
