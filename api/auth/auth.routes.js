import express from 'express';
import { login, logout, signup, refreshToken, googleLogin } from './auth.controller.js';


const router= express.Router();

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)
router.post('/refresh', refreshToken)
router.post('/google', googleLogin)


export const authRoutes = router

