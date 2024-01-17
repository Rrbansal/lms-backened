import express from 'express';
import {
    authorizationROLES,
    isloggedIn,
    authorizationsubs
  } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';
import { getallcourses,getlecturesbycourseid,createcourse,updatecourse,removecourse,addlecturebycourseid ,removelecture} from '../controllers/course.controller.js';
const router=express();


router.route('/').get(getallcourses).post(isloggedIn,authorizationROLES("ADMIN"),upload.single("thumbnail"),createcourse).delete(isloggedIn,authorizationROLES("ADMIN"),removelecture);
// authorizationsubs ye remove kia getlecturesbycourseid iise
router.route('/:id').get(isloggedIn,getlecturesbycourseid).put(isloggedIn,authorizationROLES("ADMIN"),updatecourse).delete(isloggedIn,authorizationROLES("ADMIN"),removecourse).post(isloggedIn,authorizationROLES("ADMIN"),upload.single("lecture"),addlecturebycourseid);
export default router;
