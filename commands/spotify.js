this.execute = function(arg){
	if (arg == "next"){
		exec("osascript -e 'tell application \"Spotify\" to next track'");
	}
	if (arg == "previous"){
		exec("osascript -e 'tell application \"Spotify\" to previous track'");
	}
};