import mongoose from 'mongoose';
import { param, body, validationResult } from 'express-validator';

import apiResponse from '../../handlers/apiResponse.js';
/**
 * Get one Model object by Id
 *
 * @param {Request} req Http Request
 * @param {Response} res Http Response
 * @returns {Response} Return an HTTP Response with a message and data that is
 *  a Models by id
 */
const readMethod = [
  param('id').isEmpty().withMessage('Not found id from your request'),
  async (Model, req, res) => {
    try {
      //Validate parameter before Find
      const errorValidate = validationResult(req);
      if (!errorValidate.isEmpty()) {
        return apiResponse.validationErrorResponse(
          res,
          'Validation error',
          errorValidate.array()
        );
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return apiResponse.successResponseWithData(res,'Operation success',{});
      }
      // Find document by id
      const result = await Model.findOne({ id: req.params.id });
      // If no results found, return document not found
      if (!result) {
        return apiResponse.successResponse(
          res,
          'No document found by this id: ${req.params.id}'
        );
      } else {
        // Return success resposne
        return apiResponse.successResponseWithData(
          res,
          'we found this document by this id: ${req.params.id}',
          result
        );
      }
    } catch (err) {
      // Server Error
      return apiResponse.serverErrorResponse(res);
    }
  },
];
/**
 * Add a new MODEL to the database.
 * - The first: Function authorized user
 * - Next: validate all data in req body
 * - Finally: Insert data to database if it new or Return Bad Requset
 *
 * @param {Request}  req Http Request
 * @param {Response}  res Http Response
 * @return {Response}  Return an HTTP Response with a message and data for the newly inserted Model
 */
const createMethod = async (Model, req, res) => {
  try {
    // Creating a new document in the collection
    const result = await new Model(req.body).save();

    // Returning successfull response
    return apiResponse.successResponseWithData(
      res,
      'Successfully Created the document in Model',
      result
    );
  } catch (err) {
    // If err is thrown by Mongoose due to required validations
    if (err.name == 'ValidationError') {
      return apiResponse.validationErrorResponse(
        res,
        'Required fields are not supplied',
        []
      );
    } else {
      // Server Error
      return apiResponse.serverErrorResponse(res);
    }
  }
};

/**
 * Update Model data based on the provided ID and the new data supplied.
 * - First: Check Authorized
 * - Next: Validate parameter in request
 * - Process: Update Type model by Model.id
 *
 * @param {Request} req Http Request
 * @param {Response} res Http Response
 * @return {Response} Return an Http Response with new Model Updated
 */
const updateMethod = [
  param('id').isEmpty().withMessage('Not found id from your request'),
  async (Model, req, res) => {
    try {
      //Validate parameter before Find
      const errorValidate = validationResult(req);
      if (!errorValidate.isEmpty()) {
        return apiResponse.validationErrorResponse(
          res,
          'Validation error',
          errorValidate.array()
        );
      }
      // Find document by id and updates with the required fields
      const result = await Model.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        {
          new: true, // return the new result instead of the old one
          runValidators: true,
        }
      ).exec();

      return apiResponse.successResponseWithData(
        res,
        'Successfully Update!',
        result
      );
    } catch (err) {
      // If err is thrown by Mongoose due to required validations
      if (err.name == 'ValidationError') {
        return apiResponse.validationErrorResponse(
          res,
          'Required fields are not supplied',
          []
        );
      } else {
        // Server Error
        return apiResponse.serverErrorResponse(res);
      }
    }
  },
];

/**
 *  Delete a Single document
 *  @param {string} req.params.id
 *  @returns {string} Message response
 */

const deleteMethod = [
  param('id').isEmpty().withMessage('Not found id from your request'),
  async (Model, req, res) => {
    try {
      //Validate parameter before Find
      const errorValidate = validationResult(req);
      if (!errorValidate.isEmpty()) {
        return apiResponse.validationErrorResponse(
          res,
          'Validation error',
          errorValidate.array()
        );
      }

      // Find the document by id and delete it
      const result = await Model.findOneAndDelete({
        id: req.params.id,
      }).exec();
      // If no results found, return document not found
      if (!result) {
        return apiResponse.successResponse(
          res,
          'No document found by id ${req.params.id}'
        );
      } else {
        return apiResponse.successResponse(
          res,
          'Successfully Deleted the document by id: ${req.params.id} '
        );
      }
    } catch {
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Oops there is an Error',
      });
    }
  },
];

/**
 *  Get all documents of a Model
 *  @param {Object} req.params
 *  @returns {Object} Results with pagination
 */

const listMethod = async (Model, req, res) => {
  const page = req.query.page || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;
  try {
    //  Query the database for a list of all results
    const resultsPromise = Model.find()
      .skip(skip)
      .limit(limit)
      .sort({ created: 'desc' })
      .populate();
    // Counting the total documents
    const countPromise = Model.count();
    // Resolving both promises
    const [result, count] = await Promise.all([resultsPromise, countPromise]);
    // Calculating total pages
    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    if (count > 0) {
      return apiResponse.successResponseWithData(
        res,
        'Successfully found all documents',
        [result, pagination]
      );
    } else {
      return apiResponse.successResponseWithData(res, 'Collection is empty', [
        { result: [] },
        { pagination: [] },
      ]);
    }
  } catch {
    return res
      .status(500)
      .json({ success: false, result: [], message: 'Oops there is an Error' });
  }
};

/**
 *  Searching documents with specific properties
 * @param {Object} Model
 *  @param {Request} req
 * @param {Response} res
 *  @returns {Array} List of Documents
 */

const searchMethod = async (Model, req, res) => {
  try {
    if (req.query.length === 0) {
      return apiResponse.validationErrorResponse(req, 'Not found');
    }
    const searchConditions = {};

    for (const fielld of req.query) {
      if (req.query.hasOwnProperty(fielld)) {
        const value = req.query[fielld];
        if (!isNaN(value) || fielld === 'code' || fielld === 'parentId') {
          // if the query is number or has 'code' or 'parent Id'
          searchConditions[fielld] = value;
        } else if (typeof value === 'string') {
          // if the value of query is String type
          searchConditions[fielld] = { $regex: new RegExp(value, 'i') };
        }
      }
    }

    let results = await Model.find(searchConditions)
      .sort({ name: 'asc' })
      .limit(10);

    if (results.length >= 1) {
      return apiResponse.successResponseWithData(
        res,
        'Successfully, data found',
        results
      );
    } else {
      return apiResponse.successResponseWithData(
        res,
        'Not found data from your query',
        []
      );
    }
  } catch {
    return apiResponse.serverErrorResponse(res);
  }
};

const CRUDMethods ={
  readMethod,
  createMethod,
  deleteMethod,
  updateMethod,
  listMethod,
  searchMethod
}

export default CRUDMethods;

