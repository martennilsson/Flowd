http = require('http');
exports.help = "Shortify provided <url>";
exports.execute = function(url, callback) {
  if (url) {
    http.get({ host: 'is.gd', path: '/create.php?format=simple&url=' + url }, function(res) {
      var data = '';
      res.on('data', function(chunk) { data += chunk.toString(); });
      res.on('end', function() { callback(data); });
    });
  } else {
    callback('Please supply a URL!');
  }
};