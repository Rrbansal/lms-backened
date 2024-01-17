// import asyncHandler from "../middlewares/asyncHandler.middleware.js";
// import User from '../models/user.model.js';
import apperror from "../utils/error.util.js";
import sendEmail from "../utils/sendemail.js";
const contactUs = async (req, res, next) => {
    const { name, email, message } = req.body;
  
    if (!name || !email || !message) {
      return next(new apperror('Name, Email, Message are required'));
    }
  
    try {
      const subject = 'Contact Us Form';
      const textMessage = `${name} - ${email} <br /> ${message}`;
    await sendEmail(process.env.CONTACT_US_EMAIL, subject, textMessage);
    } catch (error) {
      console.log(error);
      return next(new apperror(error.message, 400));
    }
  
    res.status(200).json({
      success: true,
      message: 'Your request has been submitted successfully',
    });
  };
  export default contactUs