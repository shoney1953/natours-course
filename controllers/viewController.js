const Tour = require('./../models/tourModel.js');
const User = require('./../models/userModel.js');
const Booking = require('./../models/bookingModel.js');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync( async (req, res, next) => {
  // get the tour data
    const tours = await Tour.find();

    res.status(200).render('overview', {
      title: 'All Tours',
      tours
    });
  });

exports.getTour = catchAsync(async (req, res, next) => {
    
    tour = await Tour.findOne( {slug: req.params.slug})
    .populate({
      path: 'reviews',
      fields: 'reviews rating user'
    })
    ;
    if (!tour) {
      return next(new AppError('There is no Tour with that name', 404))
    }
    res.status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour
    });
  });

  exports.getLoginForm = (req, res, next) => {
   
    res.status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    ) 
    .render('login', {
      title: 'Login To Your Account' 
    });
  };

  exports.getAccount =  (req, res) => {

    res.status(200)
    .render('account', {
      title: `Your Account`
    });
  };

  exports.updateUserData = catchAsync(async (req, res, next) => {
    user = User.findByIdAndUpdate(req.user.id);
    console.log(user);
    next()
  });

  

  exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });
  
    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
  
    res.status(200).render('overview', {
      title: 'My Tours',
      tours
    });
  });