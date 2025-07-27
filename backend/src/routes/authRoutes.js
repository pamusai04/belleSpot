const express = require('express');
const { register, login, logout, adminRegister, ServiceProviderRegister, checkAuth} = require('../controllers/authController');
const {userMiddleware } = require('../middleware');

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware,logout);
authRouter.post('/service/register', ServiceProviderRegister);
authRouter.post('/admin/register', adminRegister);
authRouter.get('/check', userMiddleware, checkAuth);
module.exports = authRouter;