var util = {};

// Request의 인증 확인
util.isLogined = function(req, res, next) {// function(req(요청),res(응답),next(다음 함수로))
    if (req.session.isAuthenticated) {// 인증된다면
        return next();// 다음함수로
    }
    res.status(403).send();// 안되면 403메세지로 응답할것
}

module.exports = util;