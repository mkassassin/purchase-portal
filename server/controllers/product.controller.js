var mongooseTypes = require('mongoose').Types;
var multer = require('multer');
var reader = require('xlsx');
var path = require("path");

var productSchema = require('./../models/product.model');
var errorHandling = require('./../handling/errorHandling').errorHandling;


var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/products/');
	},
	filename: function (req, file, cb) {
		var fileName = 'ProductExcel_' + Date.now() + path.extname(file.originalname);
		cb(null, fileName);
	}
});

var upload = multer({
	storage: storage,
	fileFilter: function (req, file, callback) {
		let extension = path.extname(file.originalname).toLowerCase();
		if (['.xls', '.xlsx', '.csv'].indexOf(extension) === -1) {
			return callback(new Error('Wrong extension type'));
		}
		callback(null, true);
	}
}).single('file');




exports.productsManage = function (req, res) {
	upload(req, res, function (err) {
		if (err) {
			errorHandling.errorLogCreation(req, 'Product Manage file handling Error', 'product.controller -> productsManage', err.toString());
			res.status(417).send({ Status: false, Message: "Some errors predicted, We are unable to handle this file!", Error: err });
		} else if (!req.file) {
			res.status(400).send({ Status: false, Message: "products file is needed must" });
		} else {
			const file = reader.readFile(req.file.path);
			const sheets = file.SheetNames;
			if (sheets.length > 0) {
				const sheetData = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
				if (sheetData.length > 0) {
					productSchema.find({}, { productId: 1 }, {})
						.exec((error, result) => {
							if (error) {
								errorHandling.errorLogCreation(req, 'Product Ids list getting Error', 'product.controller -> productsManage', error.toString());
								res.status(417).send({ Status: false, Message: "Some errors predicted, We are unable to get the products!", Error: error });
							} else {
								result = JSON.parse(JSON.stringify(result));
								var productQuery = [];
								sheetData.map(obj => {
									const proSchema = new productSchema({
										productName: obj.Product_Name,
										productId: obj.Product_Id,
										category: obj.Product_Category.toLowerCase(),
										unit: obj.Unit.toLowerCase(),
										unitQuantity: obj.Unit_Quantity !== undefined ? Number(obj.Unit_Quantity) : '',
										unitPrice: obj.Unit_Price !== undefined ? Number(obj.Unit_Price) : '',
										image: obj.Image_Url,
										status: 'active'
									});
									const validatedSchema = proSchema.validateSync();
									if (validatedSchema === undefined) {
										const matchIndex = result.findIndex(objNew => objNew.productId === obj.Product_Id);
										if (matchIndex >= 0) {
											productQuery.push({
												updateOne: {
													filter: { _id: mongooseTypes.ObjectId(result[matchIndex]._id) },
													update: {
														$set: {
															productName: obj.Product_Name,
															category: obj.Product_Category.toLowerCase(),
															unit: obj.Unit.toLowerCase(),
															unitQuantity: obj.Unit_Quantity !== undefined ? Number(obj.Unit_Quantity) : '',
															unitPrice: obj.Unit_Price !== undefined ? Number(obj.Unit_Price) : '',
															image: obj.Image_Url,
														}
													},
												}
											});
										} else {
											productQuery.push({
												insertOne: { "document": proSchema }
											});
										}
									}
								});
								productSchema.bulkWrite(productQuery)
									.then(response => {
										res.status(200).send({ Status: true, Message: "products added/updated successfully", Response: '' });
									}).catch(error => {
										errorHandling.errorLogCreation(req, 'Product add/update query Error', 'product.controller -> productsManage', error.toString());
										res.status(417).send({ Status: false, Message: "Some errors predicted, We are unable to add/update the products!", Error: error });
									});
							}
						});
				} else {
					res.status(400).send({ Status: false, Message: "Unable to handle the empty records!" });
				}
			} else {
				res.status(400).send({ Status: false, Message: "Unable to handle the empty sheets!" });
			}
		}
	});
};