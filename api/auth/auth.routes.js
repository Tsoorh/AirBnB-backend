import express from 'express';
import { login,logout,signup,refreshToken } from './auth.controller.js';


const router= express.Router();

router.post('/login',login)
router.post('/signup',signup)
router.post('/logout',logout)
router.post('/refresh',refreshToken)


export const authRoutes = router

