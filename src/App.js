
/**
 * LXBot服务端
 * request 请求数据
 * respond 响应数据
 */

const express = require("express");
const app = express();
//设置主机名
const hostName = '127.0.0.1';
//设置端口
const port = 5701;
// 设置静态页面地址
app.use("/index",express.static('views'));
// 引入路由
//这是一个用于测试的路由
app.use("/notify",require("./router/NotifyRouter"));
//go-cqhttp路由
app.use("/",require("./router/Go-cqRouter"));

const server = app.listen(port,hostName, function () {
    const host = server.address().address
    const port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
});
server.keepAliveTimeout = 3 * 1000;

/*

//  主页输出 "Hello World"
app.get('/', function (req, res) {
    console.log(req.path);
    console.log("主页 GET 请求");
    res.send('Hello GET');
})

//  POST 请求
app.post('/', function (req, res) {
    console.log("主页 POST 请求");

    res.send('Hello POST');
})

//  /del_user 页面响应
app.get('/del_user', function (req, res) {
    console.log("/del_user 响应 DELETE 请求");
    res.send('删除页面');
})

//  /list_user 页面 GET 请求
app.get('/list_user', function (req, res) {
    console.log("/list_user GET 请求");
    res.send('用户列表页面');
})

// 对页面 abcd, abxcd, ab123cd, 等响应 GET 请求
app.get('/ab*cd', function(req, res) {
    console.log("/ab*cd GET 请求");
    res.send('正则匹配');
})

const service = http.createServer((request, respond) => {
    /!**
     *
     * 根据http 消息结构
     * 该处可以自定义结构数据 也可以默认
     *
     *!/
    console.log(request.headers);
    console.log(request.url);
    method[request.method](request, respond);

});
service.listen(port,hostName,()=>{
    console.log(`当前监听端口:${port}`);
})*/
