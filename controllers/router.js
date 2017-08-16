var express = require("express");
var db = require('../models/db.js');
var formidable = require('formidable');
var md5 = require('../models/md5.js');
var path = require('path');
var session = require('express-session');
var fs = require('fs');
var gm = require('gm');

var app = express();

//使用session中间件
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));


//注册时，判断当前用户名是否已经存在
exports.yzxm = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        db.find("user", {
            "name": fields.name
        }, function (err, result) {
            if (result.length == 0) {
                res.json(false);
            } else {
                res.json(true);
            }
        })
    });
    return;
}

//注册
exports.regist = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //二次加密
        var pwd = md5(md5(fields.pwd) + "胡龙超");
        db.insertOne("user", {
            "name": fields.name,
            "pwd": pwd,
            "touxiang": "kobe.jpg"
        }, function (err, result) {
            req.session.login = true;
            req.session.username = fields.name;
            res.json(result);
            return;
        })
    });
    return;
}

//判断当前存在session
exports.isLogin = function (req, res) {
    if (req.session.login) {
        db.find("user", {
            "name": req.session.username
        }, function (err, result) {
            res.json(result);
        })
        return;
    } else {
        res.json(null);
        return;
    }
}

//登录
exports.login = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //二次加密
        var mm = md5(md5(fields.pwd) + "胡龙超");
        db.find("user", {
            "name": fields.name,
            "pwd": mm
        }, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            req.session.login = true;
            req.session.username = fields.name;
            res.json(result);
            return;
        })
    });
    return;
}

//处理上传头像
exports.upImg = function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/../avatar");
    form.parse(req, function (err, fields, files) {
        var extname = path.extname(files.tupian.name);
        var oldpath = files.tupian.path;
        var newpath = path.normalize(__dirname + "/../avatar") + "/" + req.session.username + extname;
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.send("上传失败");
                return;
            }
            req.session.avatar = req.session.username + extname;
            res.redirect("/cut.html");
            return;
        })
    });
}

//cut页面返回图片
exports.getImg = function (req, res) {
    res.json(req.session.avatar);
}

//执行图片剪裁
exports.docut = function (req, res) {
    //这个页面接收几个GET请求参数
    //文件名、w、h、x、y
    var filename = req.session.avatar;
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.x;
    var y = req.query.y;

    gm("./avatar/" + filename)
        .crop(w, h, x, y)
        .resize(150, 150, "!")
        .write("./avatar/" + filename, function (err) {
            if (err) {
                res.send("-1");
                return;
            }
            db.update("user", {
                "name": req.sesson.username
            }, {
                $set: {
                    "touxiang": req.session.avatar
                }
            }, function (err, result) {
                res.json(1);
            })
        });
}

//发布微博
exports.publish = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        db.insertOne("article", {
            "name": req.session.username,
            "content": fields.content,
            "date": new Date().getTime()
        }, function (err, result) {
            res.json(result);
            return;
        })
    });
}

//获得所有微博
exports.getArticles = function (req, res) {
    var page = req.query.page;
    db.find("article", {}, {
        "page": page,
        "sort": {
            "date": -1
        },
        "pageamount": 10
    }, function (err, result) {
        if (err) {
            res.send("获取失败");
            return;
        }
        res.json(result);
        return;
    })
}
//获取指定用户头像
exports.getUserImg = function (req, res) {
    var username = req.query.username;
    db.find("user", {
        "name": username
    }, function (err, result) {
        res.json(result[0].touxiang);
    })
}

//获取所有微博总数
exports.getAllCount = function (req, res) {
    db.getAll("article", function (result) {
        res.json(result);
    })
}

//获取指定用户所有微博
exports.getUserArticles = function (req, res) {
    var username = req.params.user;
    console.log(username);
    db.find("article", {
        "name": username
    }, function (err, result) {
        if (err) {
            throw new Error("查找失败");
            return;
        }
        res.json(result);
        return;
    })
}
