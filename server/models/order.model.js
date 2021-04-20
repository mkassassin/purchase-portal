const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ordersSchema = new Schema({
	customer: { type: Schema.Types.ObjectId, ref: 'customers', required: true },
	product: { type: Schema.Types.ObjectId, ref: 'products', required: true },
	orderKey: { type: String, required: true },
	ordered_product: {
		productName: { type: String, required: true },
		unit: { type: String,
			enum: ['item', 'g', 'kg', 'ml', 'l' ],
			default: 'item',
			required: true },
		unitQuantity: { type: Number, required: true },
		unitPrice: { type: Number, required: true },
		image: { type: String }
	},
	ordered_count: { type: Number, required: true },
	ordered_date: { type: Date, required: true },
	status: { type: String,
		enum: ['active','inactive','deleted'],
		default: 'active',
		required: true }
},{
	timestamps: true
});

module.exports = mongoose.model("orders", ordersSchema);