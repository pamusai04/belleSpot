const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-11299.crce206.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 11299
    }
});
module.exports = redisClient;

