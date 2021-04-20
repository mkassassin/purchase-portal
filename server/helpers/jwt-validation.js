const jwt = require('jsonwebtoken');
var secretConfig = require('./../../config/secrets.config');


const verifyToken = (req, res, next) => {
	const token = req.header('auth-token');
	if (!token) return res.status(401).json({ error: 'Access denied!' });
	try {
		const verified = jwt.verify(token, secretConfig.jwt_secret);
		req.body.customer = verified;
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			res.status(400).json({ error: 'your token is expired!' });
		} else {
			res.status(400).json({ error: 'token is not valid!' });
		}
	}
};

const adminTokenVerify = (req, res, next) => {
	const token = req.header('auth-token');
	if (!token) return res.status(401).json({ error: 'Access denied!' });
	try {
		const verified = jwt.verify(token, secretConfig.admin_jwt_secret);
		req.body.admin = verified;
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			res.status(400).json({ error: 'your token is expired!' });
		} else {
			res.status(400).json({ error: 'token is not valid!' });
		}
	}
};
module.exports = {
	verifyToken: verifyToken,
	adminTokenVerify: adminTokenVerify
};
