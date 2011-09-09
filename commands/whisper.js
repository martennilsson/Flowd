exports.help = "Say it out, quietly";
exports.execute = function(arg){
	if (arg){
		exec('say -v whisper '+arg);
	}
};