exports.execute = function(args, callback){
  var commands = [];
	var files = fs.readdirSync('commands');
	for(var i=0; i<files.length; i++){
		file = files[i];
		if (file.match(/\.js$/)) {
			commands.push(file.replace(/\.js$/, ""));
    }
  }
  callback("Commands: "+  commands.join(", "));
};
