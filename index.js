var url = require('url');
var fs = require('fs');
var color = require('chalk');
const express = require('express');
var Path = require('path');
const bodyParser = require("body-parser");
const safeJsonStringify = require('safe-json-stringify');
var failText = "No image found";
var fileupload = require('express-fileupload');

var port = "8081";


const app = express();
app.use(express.static('public', {
    extensions: ['html']
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(fileupload());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send("Not implemented yet");
})

app.get('/gettoken', function (request, response) {
    getUserCode();

    function getUserCode() {
        var pass;
        var ip;
        if (isNaN(request.connection.remoteAddress)) {
            ip = "192.168.1.12";
        } else
            ip = request.connection.remoteAddress;
        var numbs = ip.split(".");

        var rawNumb = parseInt(numbs[0]);
        for (let i = 0; i < numbs.length; i++) {
            rawNumb *= parseInt(numbs[i]);
        }
        rawNumb += parseInt(numbs.concat());
        var tokenLoc = __dirname + `/public/${rawNumb.toString(16)}/P__.json`;
        if (fs.existsSync(tokenLoc)) { pass = LoadJson(tokenLoc).key } else pass = makeid();

        var content = { "token": rawNumb.toString(16), "key": pass }
        SaveJson(content, tokenLoc);
        response.send(content);
    }
})

app.post('/upload', function (req, res) {
    var user;
    var fileName;
    if (req.query.filename === undefined) {
        fileName = "NoName";
    } else fileName = req.query.filename;
    console.log(req.query.filename);
    if (req.query.key == undefined || req.query.token == undefined) {
        res.send("You're wrong!"); return;
    }

    var token = req.query.token;
    var key = req.query.key;
    var tokenLoc = __dirname + `/public/${token}/P__.json`;

    if (fs.existsSync(tokenLoc)) user = LoadJson(tokenLoc)
    if (user.key != key) { res.send("You're wrong!"); return; }

    var loc = __dirname + `/public/${token}/${fileName}.json`;

    SaveJson(req.body,/*req.protocol + "://" + req.get('host')*/loc);
});

app.listen(port, () => console.log(color.green(`Started on port ${port}!`)))

function SaveJson(json, location) {
    let data;
    var dir = location.substring(0, location.lastIndexOf("/"));
    checkDirectory(dir);
    if (!fs.existsSync(location)) { var newData = {}; fs.writeFileSync(location, newData); }

    try {
        data = JSON.stringify(json, null, 4);
    } catch (error) {
        data = safeJsonStringify(json, null, 4);
    }
    fs.writeFileSync(location, data);
}
function LoadJson(location) {
    let rawdata;
    rawdata = fs.readFileSync(location);
    let loadData = JSON.parse(rawdata);
    return loadData;
}
function checkDirectory(directory) {
    try {
        fs.statSync(directory);
    } catch (e) {
        fs.mkdirSync(directory);
    }
}
function makeid(length = 10) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

//http://example.com/api/users?id=4&token=sdfa3&geo=us
/*
var user_id = req.param('id');
  var token = req.param('token');
  var geo = req.param('geo');  
*/