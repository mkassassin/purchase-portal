const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
	productName: { type: String, required: true },
	productId: { type: String, unique: true, required: true },
	category: { type: String,
		enum: ['stockable','consumable'],
		default: 'stockable',
		required: true  },
	unit: { type: String,
		enum: ['item', 'g', 'kg', 'ml', 'l' ],
		default: 'item',
		required: true },
	unitQuantity: { type: Number, required: true },
	unitPrice: { type: Number, required: true },
	image: { type: String },
	status: { type: String,
		enum: ['active','inactive','deleted'],
		default: 'active',
		required: true }
},{
	timestamps: true
});

module.exports = mongoose.model("products", productSchema);