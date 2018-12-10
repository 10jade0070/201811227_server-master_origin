var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongodb = require('mongodb');
var session = require('express-session');
var fileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//세션세팅
app.use(session({
  secret: 'session_login',//secret:세션의 비밀 키, 쿠키값의 변조를 막기 위해서 이 값을 통해 세션을 암호화 하여 저장
  resave: false,//세션을 항상 저장할 지 여부(false권장)
  saveUninitialized: true,//세션이 저장되기전에 Uninitialized 상태로 저장
  store: new fileStore()
  
}))

// 몽고DB 연결
function connectDB() {
  var databaseUrl = "mongodb://localhost:27017/testdb";

  // DB 연결
  mongodb.connect(databaseUrl, function(err, database) {
    if (err) throw err;
    console.log('DB 연결 완료! : ' + databaseUrl);
    app.set('database', database.db('testdb'));
  });
}
connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
