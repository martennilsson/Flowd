require.paths.unshift('commands');
querystring = require('querystring');
fs = require('fs');
exec = require('child_process').exec;
require.paths.unshift('.');
flowdock = require('flowdock');

var Flowd = {};

Flowd.start = (function() {
  var config = {};
  // require config
  try {
    if (fs.lstatSync('config.js')) {
      config = require('./config').config;
    }
  } catch(e) {
  }
  config.username = process.env.FLOWD_USERNAME || config.username;
  config.password = process.env.FLOWD_PASSWORD || config.password;
  config.flowname = process.env.FLOWD_FLOWNAME || config.flowname || 'flowd';
  config.messageHost = process.env.FLOWD_MESSAGE_HOST || config.messageHost;
  config.updateInterval = config.updateInterval || 3000;
  config.syntaxErrorMessage = config.syntaxErrorMessage || 'Huh?';

	var sessionOptions = {
		host: 'www.flowdock.com',
		port: 443,
		path: '/session',
		method: 'POST',
		headers:{
			"Connection": "keep-alive"
		}
	};

	var updateInterval = config.updateInterval;
	var last_sent_at = new Date().getTime();

	// evaluate commands from file
	var availableCommands = {};
	var files = fs.readdirSync('commands');
	for(var i = 0;i < files.length; i++){
		file = files[i];
		if (file.match(/\.js$/)){
			command = file.replace(/\.js$/, "");
			availableCommands[command] = require(command);
		}
	}
	// this is the main loop
	var pollForMessages = function(){
		setInterval(function(){
			getMessages();
		}, process.env.UPDATE_INTERVAL || config.updateInterval || 3000);
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
			var match = message.content.match(/^Flowd,?\s(\w*)\s?(.*)/i);
			if(match && match.length > 1) {
        if(match[1] == 'help') {
          msg = "    Commands:\n";
          for(var cmd in availableCommands) {
            if(availableCommands.hasOwnProperty(cmd)) {
              if(availableCommands[cmd].help)
                msg += "    " + cmd + " - " + availableCommands[cmd].help + "\n";
              else
                msg += "    " + cmd + "\n";
            }
          }
          postMessage(msg);
        } else if(availableCommands[match[1]]) {
          var args = "";
          if (match.length > 2) {
            args = match[2];
          }
          availableCommands[match[1]].execute(args, postMessage);
          continue;
        } else {
          postMessage(config.syntaxErrorMessage);
        }
      }
		}
	};
	
	var postMessage = function(message){
		session.chatMessage(config.messageHost.split(".")[0], config.flowname, message);
	};

	//this starts the whole process
	var session = new flowdock.Session(config.username, config.password);
	session.subscribe(config.messageHost.split(".")[0], config.flowname);
	session.on("message", function(message) {
		parseMessages([message]);
	});
});

Flowd.start();
