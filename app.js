require('./config/config');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');

var accessareas = require('./routes/accessareas');
var pseudowires = require('./routes/pseudowires');
var vlanpools = require('./routes/vlanpools');
var inventory = require('./routes/inventory');
var subscriptions = require('./routes/subscriptions');
var deviceservices = require('./routes/deviceservices');
var ipslaicmp = require('./routes/ipslaicmp');
var db_subscriptions = require('./routes/db_subscriptions');
var accessswitchandsp = require('./routes/accessswitchandsp');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', index);
// app.use('/users', users);
app.use('/accessareas', accessareas);
app.use('/pseudowires', pseudowires);
app.use('/vlanpools', vlanpools);
app.use('/inventory', inventory);
app.use('/subscriptions', subscriptions);
app.use('/deviceservices', deviceservices);
app.use('/ipslaicmp', ipslaicmp);
app.use('/db_subscriptions', db_subscriptions);
app.use('/accessswitchandsp', accessswitchandsp);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
