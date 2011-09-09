exports.help = "Set <volume> between 0 and 7";
exports.execute = function(arg){
	arg = parseInt(arg, 10);
	if (arg && (parseInt(arg, 10) > -1) && parseInt(arg, 10) < 8) {
		exec("osascript -e 'set volume " + arg + "'");
	}
};
