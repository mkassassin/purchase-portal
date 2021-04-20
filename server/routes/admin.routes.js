module.exports = function (app) {
	var controller = require('./../controllers/admin.controller');

	app.post('/API_V1/adminManagement/adminCreate', controller.adminCreate);
	app.post('/API_V1/adminManagement/adminLogin', controller.adminLogin);

};