const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema({
	fullName: { type: String, required: true },
	mobile: { type: String },
	email: { type: String },
	userName:{ type: String, unique: true, required: true },
	password: { type: String, required: true },
	status: { type: String,
		enum: ['active','inactive','deleted'],
		default: 'active',
		required: true }
},{
	timestamps: true
});

module.exports = mongoose.model("admin", adminSchema);