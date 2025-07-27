const jwt = require('jsonwebtoken');
const User=require('../models/user')
const redisClient = require('../config/redis');

const serviceMiddleware = async(req, res, next)=>{
    try {
        
        const {token} = req.cookies;
        
        if(!token){
            throw new Error("Token is not Persent");
        }
        
        const payload = jwt.verify(token, process.env.JWT_KEY);
        const{_id, role} = payload;
        
        if(!_id || !role){
            throw new Error("Invalid token");
        }
        
        if(role !=='serviceProvider'){  //serviceProvider
            throw new Error("Access restricted to serviceProvider");
        }
        const IsBlocked = await redisClient.exists(`token:${token}`);
        if(IsBlocked){
            throw new Error("Invalid Token");
        }
        
        const result = await User.findById(_id);
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
};

module.exports = serviceMiddleware;