exports.execute = function(args, callback){
	callback("commands: "+  availableCommands.join(", "));
};
