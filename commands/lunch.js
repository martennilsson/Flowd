this.execute = function(place, callback){
	if (place == "ringos") {
		jsdom.env("http://www.ringosbistro.se/lunch.php", [
		'http://code.jquery.com/jquery-1.5.min.js'
		], function(err, window){
			callback(window.$('html body div div div lksjfalskdjfalskd').text());
		});
	}
};
