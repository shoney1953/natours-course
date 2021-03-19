//
const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const User = require('./../models/userModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
//const sendEmail = require('./../utils/email');

const createSendToken = (user, status, res) => {
  token = signToken(user);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(status).json({
      status: 'success',
      token: token
  });
}
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  };

exports.signup = catchAsync( async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });
    // const url = `${req.protocol}://${req.get('host')}/me`;
  
    url = `${req.protocol}://${req.get('host')}/me`;
  
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser._id, 201, res);
 
});
//
exports.login = catchAsync(async (req, res, next) => {
   const {email, password} = req.body;

   if (!email || !password) {
     return next(new AppError(
         'Please provide EMAIL and PASSWORD.',
         400
     ))
   };

 const user = await User.findOne({email}).select('+password');

 if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(
        'Incorrect Email or Password.',
        401
    ))
  };
  createSendToken(user._id, 200, res);

})


exports.protect = catchAsync(async (req, res, next) => {
  let token;
if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  token = req.headers.authorization.split(' ')[1];
} else if (req.cookies.jwt) {
  token = req.cookies.jwt;
}

if (!token) {
  return next(new AppError('You are not logged in. Please login to get access.', 401))
}
const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

const currentUser = await User.findById(decoded.id);
if (!currentUser) {
  return next(new AppError('Userid does not exist. Please login as a valid user.', 401))
}

if (currentUser.passwordChangedAt) {
if (currentUser.changedPasswordAfter(decoded.iat)) {
  return next(new AppError('Password changed after Token was created. Authentication failed. Please Login again.', 401))
}
}
req.user = currentUser;
res.locals.user = currentUser;
next();
});
exports.restrictTo = (...roles) => {

return (req, res, next) => {
  
  if (!roles.includes(req.user.role)) {
    return next(new AppError('User not authorized for this function', 403))
  }
  next();
}};

exports.logout =  (req, res, next) => {
 /*  res.cookie('jwt', 'Logged Out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  }) */
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
}

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  
if (req.cookies.jwt) {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next()
  }

  if (currentUser.passwordChangedAt) {
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next()
    }
  }
  res.locals.user = currentUser;
  return next()
}
next();

});


exports.restrictTo = (...roles) => {

return (req, res, next) => {
  console.log(req.user.role, roles);
  if (!roles.includes(req.user.role)) {
    return next(new AppError('User not authorized for this function', 403))
  }
  next();
}};

exports.forgotPassword = catchAsync( async (req, res, next) => {
  
  const user = await User.findOne({email: req.body.email});


  if (!user) {
    return next(new AppError("No user found with this email address", 404));
  };
 
  const resetToken = user.createPasswordResetToken();

  await user.save({validateBeforeSave: false});

  

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    console.log(resetURL);
 
     await new Email(user, resetURL).sendPasswordReset();
      
      res.status(200).json({
        status: 'success',
        message: 'forgot password complete'
    });
      
  } catch(err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({validateBeforeSave: false});
    return next(new AppError('There was an error sending the email. Try again Later.'), 500);
  }

});

exports.resetPassword = catchAsync( async (req, res, next) => {
  const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;

  await user.save();
  createSendToken(user._id, 200, res);
 
  next();
});
exports.updatePassword = catchAsync( async (req, res, next) => {

  
  const user = await User.findById(req.user.id).select('+password');
  
  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user._id, 200, res);
 
 

  
});