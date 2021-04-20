var mongooseTypes = require('mongoose').Types;
var cryptoJS = require("crypto-js");
var jwt = require('jsonwebtoken');

var adminSchema = require('./../models/admin.model');
var errorHandling = require('./../handling/errorHandling').errorHandling;
var secretConfig = require('./../../config/secrets.config');

exports.adminCreate = function (req, res) {
	var receivingData = req.body;

	if (!receivingData.fullName || receivingData.fullName === '') {
		res.status(400).send({ Status: false, Message: "customer name can not be empty" });
	} else if (!receivingData.userName || receivingData.userName === '') {
		res.status(400).send({ Status: false, Message: "userName can not be empty" });
	} else if (!receivingData.password || receivingData.password === '') {
		res.status(400).send({ Status: false, Message: "password  can not be empty" });
	} else {
		adminSchema.findOne({ userName: receivingData.userName }, {}, {}, function (err, result) {
			if (err) {
				errorHandling.errorLogCreation(req, 'admin userName validate error', 'admin.controller -> adminCreate', err.toString());
				res.status(417).send({ Status: false, Message: "admin userName validation error!.", Error: err });
			} else {
				if (result === null) {
					const encPassword = cryptoJS.SHA256(receivingData.password).toString(cryptoJS.enc.Hex);
					const admin = new adminSchema({
						fullName: receivingData.fullName,
						mobile: receivingData.mobile,
						email: receivingData.email,
						userName: receivingData.userName,
						password: encPassword,
						status: 'active'
					});
					admin.save(function (err_2, result_2) {
						if (err_2) {
							ErrorHandling.ErrorLogCreation(req, 'admin register error', 'admin.controller -> adminCreate', err_2.toString());
							res.status(417).send({ Status: false, Message: "Some error occurred while unable to create the admin!.", Error: err_2 });
						} else {
							result_2 = JSON.parse(JSON.stringify(result_2));
							delete result_2.password;
							delete result_2.__v;
							res.status(200).send({ Status: true, Response: result_2, Message: 'admin created success' });
						}
					});
				} else {
					res.status(400).send({ Status: false, Message: "userName already exist" });
				}
			}
		});
	}
};


exports.adminLogin = function (req, res) {
	var receivingData = req.body;

	if (!receivingData.userName || receivingData.userName === '') {
		res.status(400).send({ Status: false, Message: "email can not be empty" });
	} else if (!receivingData.password || receivingData.password === '') {
		res.status(400).send({ Status: false, Message: "password  can not be empty" });
	} else {
		adminSchema.findOne({ userName: receivingData.userName }, {}, {}, function (err, result) {
			if (err) {
				errorHandling.errorLogCreation(req, 'admin login userName validate error', 'admin.controller -> adminLogin', err.toString());
				res.status(417).send({ Status: false, Message: "admin login validation error!.", Error: err });
			} else {
				if (result !== null) {
					result = JSON.parse(JSON.stringify(result));
					const encPassword = cryptoJS.SHA256(receivingData.password).toString(cryptoJS.enc.Hex);
					if (encPassword === result.password) {
						delete result.password;
						delete result.__v;
						const token = jwt.sign({ userName: result.userName, id: result._id }, secretConfig.admin_jwt_secret, { expiresIn: "12h" });
						result.token = token;
						res.header('auth-token', token).status(200).send({ Status: true, Response: result, Message: 'admin login success' });
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
