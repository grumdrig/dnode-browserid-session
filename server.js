var redis = require('redis');
var store = redis.createClient();

store.on("error", function (err) {
    console.log("Redis error " + err);
  });

var SESSION_EXPIRE = 60 * 60 * 24 * 30;  // sessions last a month!

var express = require('express');
var dnode = require('dnode');

var server = express.createServer();

server.use(express.static(__dirname));

dnode(function (client, connection) {

    connection.on('request', function (req) {
        console.log("REQUEST");
      });
    
    connection.on('ready', function () {
        console.log("CLIENT");
        console.dir(client);
        console.log("CONN");
        console.dir(''+connection);
      });

    this.resumeSession = function (id) {
      var key = "session:" + id + ":email";
      store.get(key, function (err, email) {
          if (email) {
            store.expire(key, SESSION_EXPIRE);  // Restart session timeout
            connection.session = id;
            client.session(id, email);
          } else {
            client.noSession("You need to sign on in");
          }
        });
    }

    this.verify = function (assertion, callback) {
      verify_identity(assertion, function(response) {
          if (response.status == "okay") {
            // Look up user id
            var hash = require("crypto").createHash("sha256");
            hash.update("secret that doesn't belong on github");
            hash.update(response.email);
            hash.update(''+Math.random()); // >:(
            connection.session = hash.digest('base64');
            var key = "session:"+connection.session+":email";
            store.set(key, response.email);
            store.expire(key, SESSION_EXPIRE);
            client.session(connection.session, response.email);
            console.log("Identity verified", connection.session, response.email);
          } else {
            client.noSession("That's not legit");
          }
        });
    };

    this.signout = function () {
      store.del("session:" + connection.session + ":email", redis.print);
      client.noSession("Signed out");
    }

  }).listen(server);




function verify_identity(assertion, callback) {
  var querystring = require('querystring');
  var https = require('https');
  var fs = require('fs');

  var data = querystring.stringify({
      assertion: assertion,
      audience: "localhost:9095"
    });

  var opts = {
    host: "browserid.org",
    path: "/verify",
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length,
      'User-Agent': "RPG Ops Backend",
      'Accept': '*/*'
      }
  };

  var req = https.request(opts, function(res) {
      console.log(res.statusCode);
      var resp_body = "";
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log(chunk);
          resp_body += chunk;
        });
      res.on('end', function () {
          callback(JSON.parse(resp_body));
        });
    });

  req.on('error', function (e) { 
      console.log(JSON.stringify(e));
      callback({status:"Auth request failed"}); 
    });

  req.end(data);
}


var port = 9095;
server.listen(port);
console.log('http://localhost:' + port);
