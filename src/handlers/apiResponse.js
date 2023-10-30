/**
 * Response success with message
 * 
 * @param {Object} res HTTP Response 
 * @param {Object} msg Message
 * @returns {Response} HTTP response sussces with:
 * - status = 1
 * - http status = 200
 * - message = msg input
 */
const successResponse = function(res, msg){
    var data ={
        status: 1,
        message: msg
    };
    return res.status(200).json(data);
}
/**
 * Response success with data 
 * 
 * @param {Response} res Http Response 
 * @param {String} msg Message
 * @param {Array} data Data return
 * @returns {Response} Response with:
 * - Status = 200
 * - Message = msg input
 * - Data = data input
 */
const successResponseWithData = function(res, msg, data){
    var resData ={
        status: 1,
        message: msg,
        data: data
    };
    return res.status(200).json(resData);
}
/**
 * Response Internal Server Error
 * 
 * @param {Response} res Http Response
 * @param {String} msg Message 
 * @returns {Response} Response with:
 * - Status = 500 Internal Server Error
 * - Message = msg input
 */
const serverErrorResponse = function(res,msg){
    var message = msg || 'Oops ! Error in Server';
    var data ={
        status: 0,
        message: message
    };
    return res.status(500).json(data);
}
/**
 * Response Not Found   
 * 
 * @param {Response} res Http response
 * @param {String}  msg Message
 * @returns {Response} Response with:
 * - Status = 404 Not Found
 * - Message = msg input
 */
const notFoundResponse = function(res, msg){
    var message = msg || 'Api url does not exist'
    var data = {
        status: 0,
        message: message
    };
    return res.status(404).json(data);
}
/**
 * Response Bad Request
 * 
 * @param {Response} res Http response
 * @param {String} msg Message
 * @param {Array} data Data
 * @returns {Response} Response with:
 * - Status = 400 Bad Request
 * - Message = msg input
 * - Data = data input
 */
const validationErrorResponse = function(res, msg, data){
    var resData = {
        status: 0,
        message: msg,
        data: data
    };
    return res.status(400).json(resData);
}
/**
 * Response Unauthorized
 * 
 * @param {Response} res Http Response
 * @param {String} msg Message
 * @returns {Response} Response with:
 * - Status = 401 Unauthorized
 * - Message = msg input
 */
const unauthorizedResponse401 = function(res,msg){
    var data = {
        status: 0,
        message: msg
    };
    return res.status(401).json(data);
}

/**
 * Response Unauthorized
 * 
 * @param {Response} res Http Response
 * @param {String} msg Message
 * @returns {Response} Response with:
 * - Status = 401 Unauthorized
 * - Message = msg input
 */
const unauthorizedResponse = function(res,msg){
    var message = msg || 'Unauthorized';
    var data = {
        status: 0,
        message: msg
    };
    return res.status(403).json(data);
}

const apiResponse = {
    notFoundResponse,
    serverErrorResponse,
    successResponse,
    successResponseWithData,
    unauthorizedResponse,
    unauthorizedResponse401,
    validationErrorResponse
};

export default apiResponse;