this.execute = function(place){
	var returnString;
	if (place == "ringos") {
		jsdom.env("http://www.ringosbistro.se/lunch.php", [
		'http://code.jquery.com/jquery-1.5.min.js'
		], parseDom);
	}
	return returnString;
};