const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController.js');
const authController = require('./../controllers/authController.js');
const bookingController = require('./../controllers/bookingController.js');


router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);




module.exports = router;
