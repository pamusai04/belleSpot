const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/user');

const adminMiddleware = async(req, res, next)=>{
    try {
        const adminExists = User.exists({role:'admin'});
        if (!adminExists && req.path === '/admin/register' &&  req.method === 'POST') {
            return next();
        }

        const {token} = req.cookies;
        if(!token){
            throw new Error("Token is not Persent");
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        if(!payload._id || !payload.role){
            throw new Error("Invalid token payload");
        }
        
        if(payload.role !== 'admin'){
            throw new Error("Access restricted to administrators");
        }
        const IsBlocked =await redisClient.exists(`token:${token}`);
        
        if(IsBlocked){
            throw new Error("User account not found..");
        }

        const result = await User.findById(payload._id);
        if(!result){
            throw new Error("Invalid Credentials");
        }
        
        req.result = result;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Authentication failed",
            error: error.message
        });
    }
}

module.exports = adminMiddleware;