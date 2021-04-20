var mongooseTypes = require('mongoose').Types;
var moment = require('moment');

var orderSchema = require('../models/order.model');
var productSchema = require('../models/product.model');
var customerSchema = require('../models/customer.model');
var errorHandling = require('./../handling/errorHandling').errorHandling;

exports.createOrder = function (req, res) {
	var receivingData = req.body;

	if (!receivingData.customer || receivingData.customer === '' ) {
		res.status(400).send({ Status: false, Message: "customer can not be empty" });
	} else if (!receivingData.product || receivingData.product === '') {
		res.status(400).send({ Status: false, Message: "product can not be empty" });
	} else if (!receivingData.count || receivingData.count === '') {
		res.status(400).send({ Status: false, Message: "product count can not be empty" });
	} else {
		receivingData.customer = mongooseTypes.ObjectId(receivingData.customer.id);
		receivingData.product = mongooseTypes.ObjectId(receivingData.product);

		Promise.all([
			customerSchema.findOne({_id: receivingData.customer, status: 'active' }, {password: 0, __v: 0}).exec(),
			productSchema.findOne({ _id: receivingData.product, status: 'active' }, {}, {}).exec(),
			orderSchema.countDocuments({}).exec()
		]).then(response => {
			var cusDetails = response[0];
			var proDetails = response[1];
			var ordersCount = response[2] > 0 ? response[2] + 1 : 1;
			if (cusDetails !== null && proDetails !== null) {
				var orderKey = 'Ord-' + (ordersCount.toString()).padStart(5, 0);
				const order = new orderSchema({
					customer: cusDetails._id,
					product: proDetails._id,
					orderKey: orderKey,
					ordered_product: {
						productName: proDetails.productName,
						unit: proDetails.unit,
						unitQuantity: proDetails.unitQuantity,
						unitPrice: proDetails.unitPrice,
						image: proDetails.image
					},
					ordered_count: receivingData.count,
					ordered_date: new Date(new Date().setHours(0, 0, 0, 0)),
					status: 'active'
				});
				order.save(function (err, result) {
					if (err) {
						ErrorHandling.ErrorLogCreation(req, 'order creating error', 'order.controller -> createOrder', err.toString());
						res.status(417).send({ Status: false, Message: "Some error occurred while creating the order!.", Error: err });
					} else {
						result = JSON.parse(JSON.stringify(result));
						res.status(200).send({ Status: true, Response: result, Message: 'order successfully created' });
					}
				});
			} else {
				res.status(400).send({ Status: false, Message: "customer/product details are invalid" });
			}
		}).catch( error => {
			errorHandling.errorLogCreation(req, 'product/customer details getting error', 'order.controller -> createOrder', error.toString());
			res.status(417).send({ Status: false, Message: "product/customer details getting error!.", Error: error });
		});
	}
};


exports.updateOrder = function (req, res) {
	var receivingData = req.body;

	if (!receivingData.order || receivingData.order === '' ) {
		res.status(400).send({ Status: false, Message: "order can not be empty" });
	} else if (!receivingData.customer || receivingData.customer === '' ) {
		res.status(400).send({ Status: false, Message: "customer can not be empty" });
	} else if (!receivingData.product || receivingData.product === '') {
		res.status(400).send({ Status: false, Message: "product can not be empty" });
	} else if (!receivingData.count || receivingData.count === '') {
		res.status(400).send({ Status: false, Message: "product count can not be empty" });
	} else {
		receivingData.customer = mongooseTypes.ObjectId(receivingData.customer.id);
		receivingData.product = mongooseTypes.ObjectId(receivingData.product);
		receivingData.order = mongooseTypes.ObjectId(receivingData.order);

		Promise.all([
			customerSchema.findOne({_id: receivingData.customer, status: 'active' }, {password: 0, __v: 0}).exec(),
			productSchema.findOne({ _id: receivingData.product, status: 'active' }, {}, {}).exec(),
			orderSchema.findOne({ _id: receivingData.order, status: 'active' }, {}, {}).exec(),
		]).then(response => {
			var cusDetails = response[0];
			var proDetails = response[1];
			var ordDetails = response[2];
			if (cusDetails !== null && proDetails !== null && ordDetails !== null) {
				ordDetails.ordered_product = {
						productName: proDetails.productName,
						unit: proDetails.unit,
						unitQuantity: proDetails.unitQuantity,
						unitPrice: proDetails.unitPrice,
						image: proDetails.image
					};
				ordDetails.ordered_count = receivingData.count;
				ordDetails.save(function (err, result) {
					if (err) {
						ErrorHandling.ErrorLogCreation(req, 'order update error', 'order.controller -> updateOrder', err.toString());
						res.status(417).send({ Status: false, Message: "Some error occurred while update the order!.", Error: err });
					} else {
						result = JSON.parse(JSON.stringify(result));
						res.status(200).send({ Status: true, Response: result, Message: 'order successfully updated' });
					}
				});
			} else {
				res.status(400).send({ Status: false, Message: "customer/product/order details are invalid" });
			}
		}).catch( error => {
			errorHandling.errorLogCreation(req, 'product/customer/order details getting error', 'order.controller -> updateOrder', error.toString());
			res.status(417).send({ Status: false, Message: "product/customer/order details getting error!.", Error: error });
		});
	}
};


exports.cancelOrder = function (req, res) {
	var receivingData = req.body;

	if (!receivingData.order || receivingData.order === '' ) {
		res.status(400).send({ Status: false, Message: "order can not be empty" });
	} else if (!receivingData.customer || receivingData.customer === '' ) {
		res.status(400).send({ Status: false, Message: "customer can not be empty" });
	} else {
		receivingData.customer = mongooseTypes.ObjectId(receivingData.customer.id);
		receivingData.order = mongooseTypes.ObjectId(receivingData.order);

		Promise.all([
			customerSchema.findOne({_id: receivingData.customer, status: 'active' }, {password: 0, __v: 0}).exec(),
			orderSchema.findOne({ _id: receivingData.order, status: 'active' }, {}, {}).exec(),
		]).then(response => {
			var cusDetails = response[0];
			var ordDetails = response[1];
			if (cusDetails !== null && ordDetails !== null) {
				ordDetails.status = 'inactive';
				ordDetails.save(function (err, result) {
					if (err) {
						ErrorHandling.ErrorLogCreation(req, 'order cancel updating error', 'order.controller -> cancelOrder', err.toString());
						res.status(417).send({ Status: false, Message: "Some error occurred while update the order cancel!.", Error: err });
					} else {
						res.status(200).send({ Status: true, Response: '', Message: 'order cancel successfully updated' });
					}
				});
			} else {
				res.status(400).send({ Status: false, Message: "customer/order details are invalid" });
			}
		}).catch( error => {
			errorHandling.errorLogCreation(req, 'product/order details getting error', 'order.controller -> cancelOrder', error.toString());
			res.status(417).send({ Status: false, Message: "product/order details getting error!.", Error: error });
		});
	}
};


exports.ordersList = function (req, res) {
	var receivingData = req.body;

	if (!receivingData.customer || receivingData.customer === '' ) {
		res.status(400).send({ Status: false, Message: "customer can not be empty" });
	} else {
		receivingData.customer = mongooseTypes.ObjectId(receivingData.customer.id);
		customerSchema.findOne({_id: receivingData.customer, status: 'active' }, {password: 0, __v: 0})
		.exec( (err, result) => {
			if (err) {
				errorHandling.errorLogCreation(req, 'customer details getting error', 'order.controller -> ordersList', err.toString());
				res.status(417).send({ Status: false, Message: "customer details getting error!.", Error: err });
			} else {
				if (result !== null) {
					const skipCount = parseInt(receivingData.skipCount, 0) || 0;
					const limitCount = parseInt(receivingData.limitCount, 0) || 10;
					var shortOrder = { createdAt: -1 };
					var shortKey = receivingData.shortKey;
					var shortCondition = receivingData.shortCondition;
					var findQuery = { customer: result._id, 'status': 'active' };
					if (shortKey && shortKey !== null && shortKey !== '' && shortCondition && shortCondition !== null && shortCondition !== '') {
						shortOrder = {};
						shortOrder[shortKey] = shortCondition === 'ascending' ? 1 : -1;
				 	}
					if (receivingData.filterQuery && typeof receivingData.filterQuery === 'object' && receivingData.filterQuery !== null && receivingData.filterQuery.length > 0) {
						receivingData.filterQuery.map(obj => {
							if (obj.key === 'productName' && obj.value !== '') {
								findQuery['ordered_product.productName'] = { $regex: new RegExp(".*" + obj.value + ".*", "i") };
							}
							if (obj.key === 'productId' && obj.value !== '') {
								findQuery.product = mongooseTypes.ObjectId(obj.value);
							}
							if (obj.key === 'orderKey' && obj.value !== '') {
								findQuery.orderKey = { $regex: new RegExp(".*" + obj.value + ".*", "i") };
							}
							if ((obj.key === 'from_date' && obj.value !== '') || (obj.key === 'to_date' && obj.value !== '')) {
								if (obj.key === 'from_date' && obj.value !== '' && !findQuery.ordered_date ) {
									findQuery.ordered_date = { $gte: new Date(new Date(obj.value).setHours(0, 0, 0, 0)) };
								} else if (obj.key === 'to_date' && obj.value !== '' && !findQuery.ordered_date ) {
									findQuery.ordered_date = { $lte: new Date(new Date(obj.value).setHours(23, 59, 59, 999)) };
								} else {
									const andQuery = obj.key === 'from_date' ? { $gte: new Date(new Date(obj.value).setHours(0, 0, 0, 0)) } : { $lte: new Date(new Date(obj.value).setHours(23, 59, 59, 999)) };
									findQuery['$and'] = [{ ordered_date: findQuery.ordered_date }, { ordered_date: andQuery }];
									delete findQuery.ordered_date;
								}
							}
						});
				 	}
					Promise.all([
						orderSchema.aggregate([
							{ $match: findQuery},
							{ $addFields: { totalQuantity: { $multiply: [ "$ordered_product.unitQuantity", "$ordered_count" ] }  } },
							{ $addFields: { totalCost: { $multiply: [ "$ordered_product.unitPrice", "$ordered_count" ] }  } },
							{ $project: {
								orderKey: 1,
								product: 1,
								productName: "$ordered_product.productName",
								unit: "$ordered_product.unit",
								unitQuantity: "$ordered_product.unitQuantity",
								unitPrice: "$ordered_product.unitPrice",
								image: "$ordered_product.image",
								ordered_count: 1,
								ordered_date: 1,
								totalQuantity: 1,
								totalCost: 1
							}},
							{ $sort: shortOrder },
							{ $skip: skipCount },
							{ $limit: limitCount }]).exec(),
						orderSchema.countDocuments(findQuery).exec()
					]).then(response => {
						var list = response[0];
						var listCount = response[1];
						res.status(200).send({ Status: true, Message: "orders list", Response: list, totalCount: listCount });
					}).catch(error => {
						errorHandling.errorLogCreation(req, 'orders list getting error', 'order.controller -> ordersList', error.toString());
						res.status(417).send({ Status: false, Message: "orders list getting error!.", Error: error });
					});
				} else {
					res.status(400).send({ Status: false, Message: "customer details are invalid" });
				}
			}
		});

	}

};


exports.allOrdersDateWise = function (req, res) {

	orderSchema.aggregate([
		{ $match: {status: 'active' }},
		{
			$lookup: {
				from: "customers",
				let: { "customer": "$customer" },
				pipeline: [
					{ $match: { $expr: { $eq: ["$$customer", "$_id"] } } },
					{ $project: { "fullName": 1, "mobile": 1, "email": 1 } }
				],
				as: 'customer'
			}
		},
		{ $unwind: "$customer" },
		{ $addFields: { totalQuantity: { $multiply: [ "$ordered_product.unitQuantity", "$ordered_count" ] }  } },
		{ $addFields: { totalCost: { $multiply: [ "$ordered_product.unitPrice", "$ordered_count" ] }  } },
		{ $group: {
			_id: '$ordered_date',
			orders: {
				$push: {
					orderId: "$_id",
					customer: "$customer",
					product: "$product",
					orderKey: "$orderKey",
					productName: "$ordered_product.productName",
					unit: "$ordered_product.unit",
					unitQuantity: "$ordered_product.unitQuantity",
					unitPrice: "$ordered_product.unitPrice",
					image: "$ordered_product.image",
					ordered_count: "$ordered_count",
					totalQuantity: "$totalQuantity",
					totalCost: "$totalCost"
				}
			}
		}},
		{ $project: { "_id": 0, "ordered_date": "$_id", "orders": 1 } }
	]).exec( (err, result) => {
		if (err) {
			errorHandling.errorLogCreation(req, 'orders list getting error', 'order.controller -> allOrdersByDate', err.toString());
			res.status(417).send({ Status: false, Message: "orders list getting error!.", Error: err });
		} else {
			res.status(200).send({ Status: true, Message: "orders list", Response: result });
		}
	});
};


exports.OrdersCountDateWise = function (req, res) {

	orderSchema.aggregate([
		{ $match: {status: 'active' }},
		{ $group: {
			_id: '$ordered_date',
			orders: {
				$push: {
					orderId: "$_id",
				}
			}
		}},
		{ $project: {
			"_id": 0,
			"ordered_date": "$_id",
			"ordersCount": { $cond: { if: { $isArray: "$orders" }, then: { $size: "$orders" }, else: "NA"} } } }
	]).exec( (err, result) => {
		if (err) {
			errorHandling.errorLogCreation(req, 'Date wise orders count getting error', 'order.controller -> OrdersCountDateWise', err.toString());
			res.status(417).send({ Status: false, Message: "Date wise orders count getting error!.", Error: err });
		} else {
			res.status(200).send({ Status: true, Message: "Date wise orders count", Response: result });
		}
	});
};

exports.OrdersCountCustomerWise = function (req, res) {

	orderSchema.aggregate([
		{ $match: {status: 'active' }},
		{
			$lookup: {
				from: "customers",
				let: { "customer": "$customer" },
				pipeline: [
					{ $match: { $expr: { $eq: ["$$customer", "$_id"] } } },
					{ $project: { "fullName": 1, "mobile": 1, "email": 1 } }
				],
				as: 'customer'
			}
		},
		{ $unwind: "$customer" },
		{ $group: {
			_id: '$customer',
			orders: {
				$push: {
					orderId: "$_id",
				}
			}
		}},
		{ $project: {
			"_id": 0,
			"customer": "$_id",
			"ordersCount": { $cond: { if: { $isArray: "$orders" }, then: { $size: "$orders" }, else: "NA"} } } }
	]).exec( (err, result) => {
		if (err) {
			errorHandling.errorLogCreation(req, 'Customer wise orders count getting error', 'order.controller -> OrdersCountCustomerWise', err.toString());
			res.status(417).send({ Status: false, Message: "Customer wise orders count getting error!.", Error: err });
		} else {
			res.status(200).send({ Status: true, Message: "Customer wise orders count", Response: result });
		}
	});
};
