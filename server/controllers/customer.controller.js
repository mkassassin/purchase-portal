var mongooseTypes = require('mongoose').Types;
var cryptoJS = require("crypto-js");
var jwt = require('jsonwebtoken');

var customerSchema = require('./../models/customer.model');
var errorHandling = require('./../handling/errorHandling').errorHandling;
var secretConfig = require('./../../config/secrets.config');

exports.customerRegister = function (req, res) {
	var receivingData = req.body;

	if (!receivingData.fullName || receivingData.fullName === '') {
		res.status(400).send({ Status: false, Message: "customer name can not be empty" });
	} else if (!receivingData.email || receivingData.email === '') {
		res.status(400).send({ Status: false, Message: "email can not be empty" });
	} else if (!receivingData.password || receivingData.password === '') {
		res.status(400).send({ Status: false, Message: "password  can not be empty" });
	} else {
		customerSchema.findOne({ email: receivingData.email }, {}, {}, function (err, result) {
			if (err) {
				errorHandling.errorLogCreation(req, 'customer register email validate error', 'customer.controller -> customerRegister', err.toString());
				res.status(417).send({ Status: false, Message: "customer email validation error!.", Error: err });
			} else {
				if (result === null) {
					const encPassword = cryptoJS.SHA256(receivingData.password).toString(cryptoJS.enc.Hex);
					const customer = new customerSchema({
						fullName: receivingData.fullName,
						mobile: receivingData.mobile,
						email: receivingData.email,
						password: encPassword,
						status: 'active'
					});
					customer.save(function (err_2, result_2) {
						if (err_2) {
							ErrorHandling.ErrorLogCreation(req, 'customer register error', 'customer.controller -> customerRegister', err_2.toString());
							res.status(417).send({ Status: false, Message: "Some error occurred while unable to register the customer!.", Error: err_2 });
						} else {
							result_2 = JSON.parse(JSON.stringify(result_2));
							delete result_2.password;
							delete result_2.__v;
							res.status(200).send({ Status: true, Response: result_2, Message: 'customer registration success' });
						}
					});
				} else {
					res.status(400).send({ Status: false, Message: "customer email already exist" });
				}
			}
		});
	}
};


exports.customerLogin = function (req, res) {
	var receivingData = req.body;

	if (!receivingData.email || receivingData.email === '') {
		res.status(400).send({ Status: false, Message: "email can not be empty" });
	} else if (!receivingData.password || receivingData.password === '') {
		res.status(400).send({ Status: false, Message: "password  can not be empty" });
	} else {
		customerSchema.findOne({ email: receivingData.email }, {}, {}, function (err, result) {
			if (err) {
				errorHandling.errorLogCreation(req, 'customer login email validate error', 'customer.controller -> customerLogin', err.toString());
				res.status(417).send({ Status: false, Message: "customer login validation error!.", Error: err });
			} else {
				if (result !== null) {
					result = JSON.parse(JSON.stringify(result));
					const encPassword = cryptoJS.SHA256(receivingData.password).toString(cryptoJS.enc.Hex);
					if (encPassword === result.password) {
						delete result.password;
						delete result.__v;
						const token = jwt.sign({ email: result.email, id: result._id }, secretConfig.jwt_secret, { expiresIn: "12h" });
						result.token = token;
						res.header('auth-token', token).status(200).send({ Status: true, Response: result, Message: 'customer login success' });
					} else {
						res.status(400).send({ Status: false, Message: "incorrect password!" });
					}
				} else {
					res.status(400).send({ Status: false, Message: "invalid credentials" });
				}
			}
		});
	}
};
