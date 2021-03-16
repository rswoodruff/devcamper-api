const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// points to the path of the enviroment variable file which stores secret/sensitve information rather than in your code
// configuring eviroment variables
dotenv.config({ path: './config/config.env' });

// connects to database
connectDB();

//importing express routes
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// instanitating the express app
const app = express();

// tells express to interpret incoming request as JSON
// this is built in middelware
app.use(express.json());

// places all the cookies  in the req into req.cookies
app.use(cookieParser());

// configure development enviroment (not production)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// required to allow client to upload files 
app.use(fileupload());

// removes specific operator keys to enable pass through the mongo db and prevent user interference
// protects against sql injections
app.use(mongoSanitize());

// helps to secure express apps by sending various http headers for virus protection
app.use(helmet());

// a module used to filter input from users to prevent cross site scripting (xss) and command injection attacks
app.use(xss());

// sets the parameters for the use of the limiter
// limits the number of requests made per millisec
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
});
app.use(limiter);

// prevent http perimeter polution 
app.use(hpp());

// enabling cross origin resource sharing
app.use(cors());

 // serves static files in public directory
app.use(express.static(path.join(__dirname, 'public')));

// adding routes to express app
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
});
