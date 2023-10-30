import apiResponse from './apiResponse.js';
/*
  Catch Errors Handler

  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
*/
const catchErrors = (fn) => {
  return function (req, res, next) {
    const resp = fn(req, res, next);
    if (resp instanceof Promise) {
      return resp.catch(next);
    }
    return resp;
  };
};

/*
    Not Found Error Handler
  
    If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
  */
const notFound = (req, res, next) => {
    return apiResponse.notFoundResponse(res);
};

/*
    Development Error Handler
  
    In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
  */
const developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(
      /[a-z_-\d]+.js:\d+:\d+/gi,
      '<mark>$&</mark>'
    ),
  };

  apiResponse.serverErrorResponse(res);
};

/*
    Production Error Handler
  
    No stacktraces are leaked to admin
  */
const productionErrors = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Oops ! Error in Server',
  });
};

const unauthorizedErrors = (err, req, res, next) => {
  if (err.name == 'UnathorizedError') {
    return apiResponse.unauthorizedResponse(res, err.message);
  }
};

const errorHandler = {
  catchErrors, 
  notFound,
  developmentErrors,
  productionErrors,
  unauthorizedErrors
}

export default errorHandler;