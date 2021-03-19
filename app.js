const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const csp = require('express-csp');


const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// middleware

app.use(express.static(path.join(__dirname, 'public')));

// app.use(helmet());
app.use(helmet());
csp.extend(app, {
  policy: {
      directives: {
          'default-src': ['self'],
          'style-src': ['self', 'unsafe-inline', 'https:'],
          'font-src': ['self', 'https://fonts.gstatic.com'],
          'script-src': [
              'self',
              'unsafe-inline',
              'data',
              'blob',
              'https://js.stripe.com',
              'https://*.mapbox.com',
              'https://*.cloudflare.com/',
              'https://bundle.js:8828',
              'ws://localhost:56558/',
          ],
          'worker-src': [
              'self',
              'unsafe-inline',
              'data:',
              'blob:',
              'https://*.stripe.com',
              'https://*.mapbox.com',
              'https://*.cloudflare.com/',
              'https://bundle.js:*',
              'ws://localhost:*/',
          ],
          'frame-src': [
              'self',
              'unsafe-inline',
              'data:',
              'blob:',
              'https://*.stripe.com',
              'https://*.mapbox.com',
              'https://*.cloudflare.com/',
              'https://bundle.js:*',
              'ws://localhost:*/',
          ],
          'img-src': [
              'self',
              'unsafe-inline',
              'data:',
              'blob:',
              'https://*.stripe.com',
              'https://*.mapbox.com',
              'https://*.cloudflare.com/',
              'https://bundle.js:*',
              'ws://localhost:*/',
          ],
          'connect-src': [
              'self',
              'unsafe-inline',
              'data:',
              'blob:',
              // 'wss://<HEROKU-SUBDOMAIN>.herokuapp.com:<PORT>/',
              'https://*.stripe.com',
              'https://*.mapbox.com',
              'https://*.cloudflare.com/',
              'https://bundle.js:*',
              'ws://localhost:*/',
          ],
      },
  },
});
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour.'
})
app.use('/api', limiter);

app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);


app.all('*', (req, res, next) => {

  next(new AppError(`Cant find ${req.originalUrl} on this server.`, 404));
});

//* specifying 4 parameters indicates error handling middleware

app.use(globalErrorHandler);
 

module.exports = app;
