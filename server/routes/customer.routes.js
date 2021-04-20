module.exports = function (app) {
	var controller = require('./../controllers/customer.controller');
	var verifyToken = require('./../helpers/jwt-validation');


	app.post('/API_V1/customerManagement/customerRegister', controller.customerRegister);
	app.post('/API_V1/customerManagement/customerLogin', controller.customerLogin);

};