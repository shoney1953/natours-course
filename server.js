const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

process.on('uncaughtException', err => {
  
    console.log(err.name);
    console.log(err.message);
    console.log('UNCAUGHT EXCEPTION! Shutting down!');
    process.exit(1);
 });

const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const app = require('./app');

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {console.log('DB connection Successful!'), console.log("--------------------------------")});

const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err => {
  
   console.log(err.name);
   console.log(err.message);
   console.log('UNHANDLED REJECTION! Shutting down!');
   server.close(() => {
    process.exit(1);
   });
  
});



