import express from 'express';

// import AddressController from '../controllers/addressController.js';
import upload from '../helpers/multerUpload.js';



var router = express.Router();



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
// router.post('/country/add-excel', upload.single('file'),AddressController.addCountryFromExcel);

export default router;
