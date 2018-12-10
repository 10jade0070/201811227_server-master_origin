// npm으로 설치한 패키지 연결
var express = require('express');
var util = require('../util');
const { ObjectId } = require('mongodb'); 
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;



var ResponseType = {
  INVALID_USERNAME: 0,
  INVALID_PASSWORD: 1,
  SUCCESS: 2,
}

/* GET users listing. */
router.get('/', function(req, res, next) {


  res.send('respond with a resource');
});

// 사용자 정보 (User Info)
router.get('/info', util.isLogined, function(req, res, next) {
// 로그인 인증이 됬다면 // function(req(요청),res(응답),next(다음 함수로))
  res.json({
    // json형식으로 username,nickname 을 가져와라
    username: req.session.username,
    nickname: req.session.nickname
  });
});


// 로그인
router.post('/signin', function(req, res, next) {
  var username = req.body.username; 
  var password = req.body.password; 

  var database = req.app.get('database'); 
  var users = database.collection('users');

  if (username !== undefined && password !== undefined) {
      users.findOne({ username: username }, function(err, result) {
        if (result) {
//          if (password === result.password) { //로그인에 성공했을때 화면에 보여질 세션값 지정
          var compareResult = bcrypt.compareSync(password, result.password);
          if (compareResult) {
            req.session.isAuthenticated = true;      
            req.session.userid = result._id.toString();
            req.session.username = result.username;
            req.session.nickname = result.nickname;

            res.json({ result: ResponseType.SUCCESS });
            // res.redirect('/signin')
          } else {
            res.json({ result:ResponseType.INVALID_PASSWORD });
          }
        } else {
          res.json({ result:ResponseType.INVALID_USERNAME });
        }
      });
  }
});




// 사용자 등록
router.post('/add', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var nickname = req.body.nickname;
  //var score = req.body.score;

  var salt = bcrypt.genSaltSync(saltRounds);
  var hash = bcrypt.hashSync(password, salt);

  var database = req.app.get("database"); // 데이타베이스 객체 가져오는것
  var users = database.collection('users'); // 유저 콜렉션 가져오는것

  if (username !== undefined && password !== undefined 
    && nickname !== undefined) { 
      users.save({ "username" : username, "password" : hash, "nickname" : nickname }, 
      function(err, result) {      
        res.status(200).send("success");        
      });
  }
});

// Score 추가
router.get('/addscore/:score',  util.isLogined, function(req, res, next) {
// /:score <-url일부 주소를 파라미터값으로 받는다.

  var score = req.params.score;
  var userid = req.session.userid;

  var database = req.app.get("database");
  var users = database.collection('users');

  if (userid != undefined) { 
    result = users.updateOne({ _id: ObjectId(userid) }, 
      { $set: {
        score: Number(score),
        updatedAt: Date.now()
      }}, { upsert: true }, function(err) {
        // $set = 유저네임에 있는 값중에서 score만 update해라, 날짜 표기, <-없는기능을 추가하려면 upsert: true
        if (err) {
          res.status(200).send("failure");
        }
        res.status(200).send("success");
      });
  }
});

// Score 불러오기
router.get('/score', util.isLogined, function(req, res, next) {
  var userid = req.session.userid;
  var database = req.app.get("database");
  var users = database.collection('users');

  users.findOne({ _id: ObjectId(userid) }, function(err, result) {
    if (err) throw err;

    var resultObj = {
      // id: result._id.toString(),
      score: result.score
    }

    res.json(resultObj);
  });
});

module.exports = router;
