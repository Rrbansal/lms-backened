import express from 'express';
import { isloggedIn,authorizationROLES } from '../middlewares/auth.middleware.js';
import { getrazorpaykey,buysubscription,verifysubscription,cancelsubscription,allpayments } from '../controllers/payment.controller.js';
const router=express.Router();

router.route('/razorpay-key').get(isloggedIn,getrazorpaykey);
router.route('/subscribe').post(isloggedIn,buysubscription);
router.route('/verify').post(isloggedIn,verifysubscription);
router.route('/unsubscribe').post(isloggedIn,cancelsubscription);
router.route('/').get(isloggedIn,authorizationROLES("ADMIN"),allpayments);

export default router;