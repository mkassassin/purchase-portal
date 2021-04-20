module.exports = function (app) {
	var controller = require('./../controllers/product.controller');
	var adminTokenVerify = require('./../helpers/jwt-validation').adminTokenVerify;

	app.post('/API_V1/productsManagement/productsManage', adminTokenVerify, controller.productsManage);
};