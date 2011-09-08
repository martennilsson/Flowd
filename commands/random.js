this.execute = function(args, callback){
  if(isNaN(args)) {
    callback("That's not a number!");
  } else {
    callback(Math.round(Math.random()*args));
  }
};

