var express = require('express');
var router = require('./controllers/router.js');
var session = require('express-session');

var app = express();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
//模板引擎
app.set("view engine", "ejs");
//静态服务
app.use(express.static("./public"));
app.use(express.static("./avatar"));

app.get('/isLogin', router.isLogin); //判断当前是否登录
app.post('/login', router.login); //登录
app.post('/yzxm', router.yzxm); //验证姓名
app.post('/regist', router.regist); //注册
app.post('/upImg', router.upImg); //上传头像
app.get('/getImg', router.getImg); //返回头像
app.get('/docut', router.docut); //进行图片剪裁
app.post('/publish', router.publish); //发布微博
app.get('/getArticles', router.getArticles); //获得所有微博
app.get('/getUserImg', router.getUserImg); //获取指定用户头像
app.get('/getAllCount', router.getAllCount); //获取所有微博数
app.get('/getUserArticles/:user', router.getUserArticles); //获取指定用户所有微博

app.listen(4000);
