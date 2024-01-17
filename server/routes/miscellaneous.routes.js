import express from 'express';
import contactUs from '../controllers/miscellaneous.controller.js'
const router=express.Router();

router.route('/contact').post(contactUs);
// router
//   .route('/admin/stats/users')
//   .get(isloggedIn, authorizationROLES('ADMIN'), userStats);

export default router;