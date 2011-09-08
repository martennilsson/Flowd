require.paths.unshift('commands');
querystring = require('querystring');
https = require('https');
fs = require('fs');
exec = require('child_process').exec;
jsdom = require('jsdom').jsdom;

var Flowd = {};

//read config
try {
  if (fs.lstatSync('config.js')) {
    var config = require('./config');
  }
} catch(e) {
  var config = {};
}
config.username = process.env.FLOWD_USERNAME || config.username;
config.password = process.env.FLOWD_PASSWORD || config.password;
config.flowname = process.env.FLOWD_FLOWNAME || config.flowname || 'flowd';
config.messageHost = process.env.FLOWD_MESSAGE_HOST || config.messageHost;
config.updateInterval = config.updateInterval || 3000;
config.syntaxErrorMessage = config.syntaxErrorMessage || 'Huh?';

Flowd.start = (function() {
	var commands = "";
	availableCommands = [];
	var sessionOptions = {
		host: 'www.flowdock.com',
		port: 443,
		path: '/session',
		method: 'POST',
		headers:{
			"Connection": "keep-alive"
		}
	};
	
	var cookie;
	var updateInterval = config.updateInterval;
	var last_sent_at = new Date().getTime();

	// evaluate commands from file
	var files = fs.readdirSync('commands');
	
	for(var i = 0;i < files.length; i++){
		file = files[i];
		if (file.match(/\.js/)){
			command = file.replace(/\.js/, "");
			availableCommands.push(command);
			commands += "var "+command + "= require('"+command+"');";
		}
	}
	eval(commands);
		
	var auth = function(){
		var params = querystring.stringify({'user_session[email]': config.username,  'user_session[password]': config.password});
		var req = https.request(sessionOptions, function(res) {
			res.on("end", function(){
				cookie = res.headers['set-cookie'];
				pollForMessages(cookie);
			});
		});
		req.end(params);
		req.on('error', function(e) {
			console.error(e);
		});
	};
	
	//this is the main loop
	var pollForMessages = function (cookie){
		setInterval(function(){
			// console.log("polling");
			getMessages(cookie);
		}, process.env.UPDATE_INTERVAL || config.updateInterval || 3000);
	};

	var availableCommand = function(c){
		return (availableCommands.indexOf(c) >= 0);
	};
	
	var getMessages = function(cookie){
			var refreshTime = new Date().getTime();
			var totalData = "";
			var getMessageOptions = {
				host: process.env.MESSAGE_HOST || config.messageHost,
				port: 443,
				path: '/flows/' + config.flowname + '/apps/chat/messages?count=1&after_time='+last_sent_at,
				method: 'GET',
				headers: {"Cookie": cookie}
			};
			var req2 = https.request(getMessageOptions, function(res2) {
				res2.on('data', function(d) {
					totalData = totalData + d.toString("utf8");
				});
				res2.on('end', function(){
					b = JSON.parse(totalData);
					// console.log(b);
					parseMessages(b, function(){
						return;
					});
				});
			});
			req2.end();
	};


	var parseMessages = function (json, callback) {
		for(var i = 0; i < json.length; i++){
			var message = json[i];
			if(message.sent > last_sent_at ){
				last_sent_at = message.sent;
			}

			if (message.event != 'message'){
				return;
			}
			var match = message.content.match(/^Bot,?\s(\w*)\s?(.*)/i);
			// console.log("match: "+match);
			if(match && match.length > 1 && availableCommand(match[1])){
				var args = "";
				if (match.length > 2) {
                    args = match[2];
                }
				var parsedCommand = match[1];
				// console.log("parsedCommand: <"+parsedCommand+ "> with args: '"+args+"'");
				botResponse = eval(parsedCommand+".execute(\""+args+"\")");
				if(botResponse){
					postMessage(botResponse, cookie);
				}
				continue;
			} else if (match) {
				postMessage(config.syntaxErrorMessage, cookie);
			}
		}
		return callback();
	};
	
	var postMessage = function(message, cookie){
		var postBody = {
			app: "chat",
			channel: "/flows/" +config.flowname,
			"event": "message",
			message: "\""+message+"\"",
			"private": "false",
			tags: ""
		};
		
		var options = {
			host: config.messageHost,
			port: 443,
			path: '/messages',
			method: 'POST',
			headers: {
				"Cookie": cookie, 
				"Content-Type": "application/x-www-form-urlencoded"
			}
		};
		

		var req = https.request(options, function(res) {
			res.on('end', function(err, data) {
				if(err){
					// console.log("err on end: "+err);
				} else if (data) {
					// console.log("data on end: "+ data);
				}
			});
			res.on('data', function(err, data) {
				if(err){
					// console.log("err on data: "+err);
				} else if (data) {
					// console.log("data on data: "+ data);
				}
			});

		});
		req.write(querystring.stringify(postBody));
		req.end();
	};
	//this starts the whole process
	auth();
});

Flowd.start();
