const redisClient = require('../config/redis');

const windowSize = 3600; // 1 hour in seconds
const MaxRequest = 60;

const rateLimiter = async (req, res, next) => {
    try {
        // Use IP + route path as key for more granular control
        const key = `RATE_LIMIT:${req.ip}:${req.path}`;
        const current_time = Math.floor(Date.now() / 1000);
        const window_Time = current_time - windowSize;

        // Start Redis transaction
        const multi = redisClient.multi();
        multi.zRemRangeByScore(key, 0, window_Time);
        multi.zCard(key);
        
        // Execute the transaction
        const results = await multi.exec();
        
        if (!results || results.length < 2) {
            console.error('Redis transaction failed - unexpected results:', results);
            return next(); // Fail open - allow the request
        }
        
        const numberOfRequest = results[1]; // Result of zCard

        if (numberOfRequest >= MaxRequest) {
            // Calculate remaining time
            const oldestRequest = await redisClient.zRange(key, 0, 0, { WITHSCORES: true });
            const remainingTime = oldestRequest && oldestRequest[1] 
                ? Math.ceil(windowSize - (current_time - oldestRequest[1]))
                : windowSize;
            
            // Set rate limit headers
            res.set({
                'X-RateLimit-Limit': MaxRequest,
                'X-RateLimit-Remaining': 0,
                'X-RateLimit-Reset': remainingTime
            });

            return res.status(429).json({
                success: false,
                error: "Too many requests. Please try again later.",
                retryAfter: remainingTime
            });
        }

        // Add current request
        await redisClient.zAdd(key, {
            score: current_time,
            value: `${current_time}:${req.method}:${req.path}`
        });
        await redisClient.expire(key, windowSize);

        // Set rate limit headers for successful requests
        res.set({
            'X-RateLimit-Limit': MaxRequest,
            'X-RateLimit-Remaining': MaxRequest - numberOfRequest - 1,
            'X-RateLimit-Reset': windowSize
        });

        return next(); 
    } catch (error) {
        return next();
    }
};

module.exports = rateLimiter;