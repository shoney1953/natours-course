const AppError = require('./../utils/appError');

const sendErrDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
  console.error('ERROR 💣, err');
  return res.status(err.statusCode).render('error',
    {
      title: 'Something Went Wrong',
      msg: err.message
    })
}

const sendErrProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) { 
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(err.statusCode).json({
      status: err.status,
      message: 'Something Went Very Wrong'
    });
   }
   // Rendered Website   
  if (err.isOperational) {
    return res.status(err.statusCode).render('error',
    {
      title: 'Something Went Wrong',
      msg: err.message
    });
    
  } 
    console.error('ERROR 💣, err');
    return res.status(err.statusCode).render('error',
    {
      title: 'Something Went Wrong',
      msg: 'Please try again Later.'
    });
}

const handleCastErrDB = (err) => {
  const message = `Invalid ${err.path} is ${err.value}`;
  return new AppError(message, 400);
}
const handleObjectIDDB = (err) => {
  const message = `Invalid Object Identification ${err.value}`;
  return new AppError(message, 400);
}
const handleDuplicateFieldsDB = err => {

  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {

  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () => new AppError('Invalid Token; Please login again!', 401);
const handleJWTExpiredError = () => new AppError('Token Expired; Please login again!', 401);
 

module.exports = ((err, req, res, next) => {
 
  let error = { ...err };
  
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    error.status = 'error';
    console.log('environment', process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'development') {
   sendErrDev(err, req, res);
  } else if (process.env.NODE_ENV = 'production') {
    error.message = err.message;
  
    if (err.kind = 'ObjectId') err = handleCastErrDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (error.name === 'ValidationError')
      err = handleValidationErrorDB(err); 

    if (error.name === 'JsonWebTokenError')
      err = handleJWTError();
    if (error.name === 'TokenExpiredError')
       err = handleJWTExpiredError();

    sendErrProd(error, req, res);
  }

    next();
  });