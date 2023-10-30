import express from 'express';

import typeController from '../controllers/typeController.js';
import upload from '../helpers/multerUpload.js';


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
router.post('/add-excel', upload.single('file'),typeController.importFromExcel);

export default router;
