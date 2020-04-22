'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3900;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/rest_api', { useNewUrlParser: true })
	.then(() => {
		console.log('DB connection succeeded');

		//Listen HTPP requests on port 3900
		app.listen(port, () => {
			console.log('Server running on http://localhost:'+port);
		});

	});