this.execute = function(arg){
	arg = parseInt(arg)
	if (arg && (parseInt(arg) > -1) && parseInt(arg) < 8){
		exec("osascript -e 'set volume " + arg + "'");
	}
};