const express = require('express');

const router = express.Router();

const tourController = require('../controllers/tourController.js');
const authController = require('../controllers/authController.js');
const bookingController = require('../controllers/bookingController.js');

router.use(authController.protect)
router
  .route('/checkout-session/:tourId')
  .get(bookingController.getCheckoutSession);


router.use(authController.protect, authController.restrictTo('admin', 'lead-guide'))
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking) 
  .delete(bookingController.deleteBooking);



  module.exports = router;
