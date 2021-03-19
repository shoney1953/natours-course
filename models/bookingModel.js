const mongoose = require('mongoose');
const slugify = require('slugify');
const Tour = require('./tourModel');

const bookingSchema = new mongoose.Schema(
{
 tour: {
     type: mongoose.Schema.ObjectId,
     ref: 'Tour',
     required: [true, 'Booking must belong to a tour'],
 },
 user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user'],
},
price: {
    type: Number,
    required: [true, 'A Tour must have a price.'],
},
createdAt: {
    type: Date,
    default: Date.now(),
},
paid: {
    type: Boolean,
    default: true,
}
}
);
bookingSchema.index({ tour: 1, user: 1 });

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
      path: 'tour',
      select: 'name'
    })  ;
    next();
});
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;