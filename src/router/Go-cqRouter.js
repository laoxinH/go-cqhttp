// 引入express模块
const express = require("express");
// 定义路由中间件
const router = express.Router();
// 定义为模块
module.exports = router;
const method = require("../event/Method");
// 引入工具类

// 按照 post_type 进行事件分发
router.post('/',  express.json(), function (req, res, next) {
    //console.log([req.body.post_type]);
    method[req.body.post_type](req,res);
});
router.post('/',  function (req, res, next) {

});
