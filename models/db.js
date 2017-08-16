var MongoClient = require('mongodb').MongoClient;
var setting = require("./setting.js");

function connect(callback) {
    //获取数据库地址
    var url = setting.dburl;
    //链接数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(err, db);
    });
}

//插入数据
exports.insertOne = function (collection, data, callback) {
    connect(function (err, db) {
        db.collection(collection).insertOne(data, function (err, result) {
            callback(err, result);
            return;
        })
    })
}

//查找数据

exports.find = function (collection, data, C, D) {
    //保存查询结果
    var result = [];
    if (arguments.length == 3) {
        var callback = C;
        var skipNumber = 0;
        var limit = 0;
    } else if (arguments.length == 4) {
        var callback = D;
        var args = C;

        var skipNumber = args.pageamount * args.page || 0;

        var limit = parseInt(args.pageamount) || 0;

        var sort = args.sort || {};
    } else {
        throw new Error("函数参数不对");
        return;
    }

    connect(function (err, db) {
        var cursor = db.collection(collection).find(data).skip(skipNumber).limit(limit).sort(sort);
        cursor.each(function (err, doc) {
            if (err) {
                callback(err, null);
                db.close();
                return;
            }
            if (doc != null) {
                result.push(doc);
            } else {
                callback(null, result);
                db.close();
                return;
            }
        });
    });
}

exports.detele = function (collection, data, callback) {
    connect(function (err, db) {
        db.collection(collection).deleteMany(data, function (err, result) {
            callback(err, result);
            db.close();
        })
    })
}

//修改数据

exports.update = function (collection, json1, json2, callback) {
    connect(function (err, db) {
        db.collection(collection).updateMany(json1, json2, function (err, results) {
            callback(err, results);
            db.close();
        })
    })
}

//获取微博总数
exports.getAll = function (collention, callback) {
    connect(function (err, db) {
        db.collection(collention).count({}).then(function (count) {
            callback(count);
            db.close();
        })
    })
}
