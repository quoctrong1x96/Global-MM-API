var express = require("express");
const typeController = require('../controllers/typeController');
const upload = require("../helpers/multerUpload");


var router = express.Router();

//router

/**
 * @swagger
 * /api/type/add-excel:
 *   post:
 *     summary: Insert Type data from excel
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
router.post('/add-excel', upload.single('file'),typeController.addTypeFromExcel);

module.exports = router;
