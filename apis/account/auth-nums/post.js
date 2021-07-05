const utils = require("../../../utils");
const std = require("../../../standards");
const authNumStd = std.authNum;

module.exports = {
  validation: () => {
    return (req, res, next) => {
      let body = req.body;

      if (body.type === undefined || body.key === undefined) {
        res.status(400);
        return res.json({ code: "400_2" });
      }

      if (
        body.type !== authNumStd.authNumTypeEmail &&
        body.type !== authNumStd.authNumTypePhone
      ) {
        res.status(400);
        return res.json({ code: "400_1" });
      }

      if (body.type === authNumStd.authNumTypeEmail) {
        let regExp =
          /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        if (!regExp.test(body.key)) {
          res.status(400);
          return res.json({ code: "400_3" });
        }
      } else if (body.type === authNumStd.authNumTypePhone) {
        let regExp = /^\d{3}-\d{3,4}-\d{4}$/;
        if (!regExp.test(body.key)) {
          res.status(400);
          return res.json({ code: "400_4" });
        }
      } else {
        console.log("error");
      }
      // todo 개발자에게 메일/문자 보내기

      next();
    };
  },

  authNumGenerator: () => {
    return (req, res, next) => {
      req.authNum = utils.createRandomString(authNumStd.length);

      next();
    };
  },

  encryption: () => {
    return (req, res, next) => {
      req.authNumEncrypt = utils.encryption(req.authNum);

      next();
    };
  },

  syncDB: (db) => {
    return (req, res, next) => {
      let body = req.body;
      let auth = db.schema.auth;
      let pk = db.pk;

      let bExistence = false;
      for (let authPk in auth) {
        if (auth[authPk].type === body.type && auth[authPk].key === body.key) {
          // if (auth[authPk].key === body.key) { // 이건 key값만 확인해도 되지 않을까?
          // 질문. 악의적인 목적을 가지고 010-1111-1111이라는 번호로 계속해서 요청을 보내고 있는 상황이라고 가정을 해보자.
          //      그렇다면 해당 번호는 데이터베이스에 저장되어있기 때문에 인증번호는 계속해서 바뀌고 있는 중일 것이다.
          //      만약 해당 번호(010-1111-1111)를 실제로 사용하는 유저가 인증번호를 요청했을 경우
          //      해당 번호에 대한 인증번호는 악의적인 공격에 의해 짧은 시간안에 또 바뀌게 될 것이고,
          //      그렇기에 실제 유저는 자신이 받은 인증번호를 쓸 수 없게 된다.
          // 먼저 위와 같은 상황이 연출될 경우, 해당 번호를 가지고 있는 사람은 거의 매 초, 혹은 그보다 더 짧은 시간을 간격으로 인증번호 문자를 받게되어 문제상황임을 알 수 있다.
          // 또한, 서버 측에서 미리 설정해 놓은 시간내에 같은 번호로 몇 회 이상의 요청을 받게 되면 해당 유저를 악의적인 목적을 가지고 있다고 판단하게 하여 문제사황을 예방할 수도 있다.
          bExistence = true;
          auth[authPk].authNumEncrypt = req.authNumEncrypt;
          auth[authPk].createdAt = Date.now();
          break;
        }
      }

      if (!bExistence) {
        auth[pk.authPk] = {
          authNumEncrypt: req.authNumEncrypt,
          key: body.key,
          type: body.type,
          createdAt: Date.now(),
        };
        pk.authPk++;
      }

      // ! check
      // console.log("auth: ", auth)

      next();
    };
  },

  responder: () => {
    return (req, res) => {
      res.status(201).json({ authNum: req.authNum });
    };
  },
};
