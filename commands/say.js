exports.help = "Say it out loud!";
exports.execute = function(arg){
	if (arg){
		exec('say '+arg);
	}
};
