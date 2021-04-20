var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var app = express();

var dbConfig = require('./config/database.config.js');
var envConfig = require('./config/env.config.js');
var errorHandling = require('./server/handling/errorHandling.js').errorHandling;


process.setMaxListeners(0);
process.on('unhandledRejection', (reason, promise) => {
	console.log(reason);
	errorHandling.errorLogCreation('', 'Un Handled Rejection', '', reason);
});
process.on('uncaughtException', function (err) {
	console.log(err);
	errorHandling.errorLogCreation('', 'Un Caught Exception', '', err.toString());
});


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
mongoose.connection.on('error', function (err) {
	errorHandling.errorLogCreation('', 'DB connection error', '', err.toString());
	console.log('Could not connect to the database. Exiting now...');
	process.exit();
});
mongoose.connection.once('open', function () {
	console.log("Successfully connected to the database");
});


require('./server/routes/admin.routes')(app);
require('./server/routes/product.routes')(app);
require('./server/routes/customer.routes')(app);
require('./server/routes/order.routes')(app);


app.get('*', function (req, res) {
	res.send('This is Server Side Page');
});

app.listen(envConfig.port, function () {
	console.log('Server is listening on port ' + envConfig.port);
});
