import express from 'express';
import {
    authorizationROLES,
    isloggedIn,
  } from '../middlewares/auth.middleware.js';

const router=express.Router();
import { register,login,logout,getprofile,forgotpassword,resetpassword,changepassword,updateuser} from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js';



router.post('/register',upload.single("avatar"),register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/me',isloggedIn,getprofile);
router.post('/forgot-password',forgotpassword);
router.post("/reset/:resetToken",resetpassword);
router.post("/changepassword",isloggedIn,changepassword);
router.post("/update/:id",isloggedIn,upload.single("avatar"),updateuser);

export default router;





