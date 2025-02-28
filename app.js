const createError = require('http-errors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const RateLimit = require('express-rate-limit');
const passport = require('./middlewares/passport');
require('dotenv').config();

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const clubRouter = require('./routes/club');
const usersRouter = require('./routes/users');

const app = express();

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50,
});

// Set up mongoose connection
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URI || process.env.MONGODB_URI_DEV;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.session());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
app.use(compression()); // Compress all routes
// Apply rate limiter to all requests
app.use(limiter);
// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'script-src': ["'self'", 'code.jquery.com', 'cdn.jsdelivr.net'],
    },
  })
);

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/club', clubRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
