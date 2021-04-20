module.exports = function (app) {
	var controller = require('./../controllers/order.controller');
	var verifyToken = require('./../helpers/jwt-validation').verifyToken;
	var adminTokenVerify = require('./../helpers/jwt-validation').adminTokenVerify;


	app.post('/API_V1/orderManagement/createOrder', verifyToken, controller.createOrder);
	app.post('/API_V1/orderManagement/updateOrder', verifyToken, controller.updateOrder);
	app.post('/API_V1/orderManagement/cancelOrder', verifyToken, controller.cancelOrder);
	app.post('/API_V1/orderManagement/ordersList', verifyToken, controller.ordersList);
	app.post('/API_V1/orderManagement/OrdersCountDateWise', adminTokenVerify, controller.OrdersCountDateWise);
	app.post('/API_V1/orderManagement/OrdersCountCustomerWise', adminTokenVerify, controller.OrdersCountCustomerWise);

};