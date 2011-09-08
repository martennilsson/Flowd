Flowd is a node.js Flowdock bot

## Installation:

	install node.js
	git clone git@github.com:martennilsson/Flowd.git
	cd Flowd
	cp config.js.example config.js

edit config.js and supply your own details
		

## Create your own command:
Create a file in commands/ with the name of your command as file name.
Define a function in the file like this:

*ping.js*

	this.execute = function(args){
		return "pong " + args;
	};
	
If the function returns a string, Flowd will post this message to the flow.
	

### TODO
	- make commands file name agnostic
	- make update of commands easier

