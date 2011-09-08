this.execute = function(args){
  if(isNaN(args)) {
    return "That's not a number!";
  } else {
    return Math.round(Math.random()*args);
  }
};

