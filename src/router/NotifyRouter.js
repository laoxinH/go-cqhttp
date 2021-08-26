// 引入express模块
const express = require("express");
// 定义路由中间件
const router = express.Router();
// 定义为模块
module.exports = router;
router.get("/",((req, res) => {
    res.send({jsp:"test"});

}));

router.get("/",(req, res) => {
    res.send("这是一个测试页面");
})

