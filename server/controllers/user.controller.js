import apperror from '../utils/error.util.js'
import User from '../models/user.model.js';
import cloudinary from 'cloudinary'
import fs from 'fs/promises';
import sendEmail from '../utils/sendemail.js';
import crypto from 'crypto';

const cookieOptions=
{
    maxAge:7*24*60*60*1000,
    httpOnly:true,
    secure:true
}

const register=async(req,res,next)=>
{
    const {fullname,email,password}=req.body;
    if(!fullname || !email || !password){ return next(new apperror('all feilds are required',400)); }

    const userExists = await User.findOne({email});
    if(userExists){ return next(new apperror('email already exists',400)); }

    const user=await User.create(
        {
            fullname,
            email,
            password,
            avatar:
            {
                public_id:email,
                // initialized to empty 
                secure_url:'',
            }
});

    if(!user){return next(new apperror('user registertation failed please try again',400)); }
       console.log("file is",JSON.stringify(req.file));
       
        if (req.file) {
            try {
              const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms', // Save files in a folder named lms
                width: 250,
                height: 250,
                gravity: 'faces', 
                crop: 'fill',
              });
    
              if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;
        
                fs.rm(`uploads/${req.file.filename}`);
              }
            } catch (error) {
              return next(new apperror(error || 'File not uploaded, please try again', 400));
            }
        }
  await user.save();

  const token = await user.generateJWTToken();

  user.password = undefined;

  res.cookie('token', token, cookieOptions);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user,
  });
}

const login=async (req,res,next)=>
{

    try{
        const {email,password}=req.body;
    if(!email || !password)
    {
        return next(new apperror('all feilds are required',400));
    }
    const user=await User.findOne({email}).select('+password');
    console.log('aa')

    if (!(user && (await user.comparePasswod(password)))) {
      return next(
        new apperror('Email or Password do not match or user does not exist', 401)
      );
    }
    console.log('bb')
    const token=await user.generateJWTToken();
    user.password=undefined;
    res.cookie("token",token,cookieOptions);

    res.status(200).json({
            success:true,
            message:"user logged in succesfuult",
            user,
        }
    )
   }catch(e)
    {
        return next(new apperror(e.message,400));
    }
};


const logout=(req,res)=>
{
    res.cookie("token",null,
    {
        secure:true,
        maxAge:0,
        httpOnly:true,
    });
    res.status(200).json(
        {
            success:true,
            message:"user logged out succesfully"
        }
    )
}

const getprofile=async(req,res,next)=>
{
   try{
    const userid=req.user.id;
    const user=await User.findById(userid);
    res.status(200).json(
        {
            success:true,
            message:"user detials",
            user,
        });
   }catch(e)
   {
    return next(new apperror('failed to fetch profile details',500));
   }
}

const forgotpassword=async(req,res,next)=>
{
    const {email} = req.body;

    if(!email)
    {
        return next(new apperror('email required',400));
    }

    const user=await User.findOne({email});
    if(!user)
    {
        return next(new apperror('email not registered',500));
    }

    const resettoken=await user.generatePassResetToken();
    await user.save();

    const resetpasswordurl=`${process.env.FRONTEND_URL}/reset/${resettoken}`;
    console.log(resetpasswordurl);

    const subject='reset password';
    const message = `you can change your password by clicking in this link  ${resetpasswordurl}.\n If you have not requested this, kindly ignore.`;
        try{
        await sendEmail(email,subject,message);
        res.status(200).json(
            {
                success:true,
                message:`reset password token has been sent to ${email} succesfully`
            }
        )
    }catch(e)
    {
        user.forgotpasswordexpiry=undefined;
        user.forgotpasswordtoken=undefined;
        await user.save();
        return next(new apperror('e.message',500));
    }
}



 const resetpassword = async (req, res, next) => {
    const { resetToken } = req.params;
  
    const { password } = req.body;
  
    const forgotpasswordtoken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    if (!password) {
      return next(new apperror('Password is required', 400));
    }
  
    const user = await User.findOne({
      forgotpasswordtoken,
      forgotpasswordexpiry: { $gt: Date.now() }, // $gt will help us check for greater than value, with this we can check if token is valid or expired
    });
  
    if (!user) {
      return next(
        new apperror('Token is invalid or expired, please try again', 400)
      );
    }
  
    user.password = password;
  
    user.forgotpasswordtoken = undefined;
    user.forgotpasswordexpiry = undefined;
  
    await user.save();
  
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });

  };


  const changepassword=async(req,res,next)=>
  {

    const {oldpassword,newpassword}=req.body;

    const {id}=req.user;

    if(!oldpassword || !newpassword)
    {
        return next(new apperror('all feilds are required',400));
    }

    const user=await User.findById(id).select('+password')

    if(!user)
    {
        return next(new apperror('user does not exist',400));    
    }


    const ispasswordvalid=await user.comparePasswod(oldpassword);

        if(!ispasswordvalid)
        {
            return next(new apperror('invalid password',400));
        }

        user.password=newpassword;

        await user.save();

        user.password=undefined;

        res.status(200).json(
            {
                success:true,
                message:"password chnaged succesfully"
            });
  }
  

  
  const updateuser = async (req, res, next) => {
    // Destructuring the necessary data from the req object
    const { fullname } = req.body;
    // const { id } = req.user;
    const { id } = req.params;
  
    const user = await User.findById(id);
  
    if (!user) {
      return next(new apperror('Invalid user id or user does not exist'));
    }
    
    if (fullname) {
      console.log(fullname)
      user.fullname = fullname;
    }
  
    // Run only if user sends a file
    if (req.file) {
        // Deletes the old image uploaded by the user  
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  
        try {
          const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms', // Save files in a folder named lms
            width: 250,
            height: 250,
            gravity: 'faces', // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
            crop: 'fill',
          });
    
          // If success
          if (result) {
            user.avatar.public_id = result.public_id;
            user.avatar.secure_url = result.secure_url;
    
            // After successful upload remove the file from local storage
            fs.rm(`uploads/${req.file.filename}`);
          }
          await user.save();
        } catch (error) {
          return next(
            new apperror(error || 'File not uploaded, please try again', 400)
          );
        }
    }
  
    // Save the user object
    await user.save();
  
    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
    });
  };
export{
    register,
    login,
    logout,
    getprofile,
    forgotpassword,
    resetpassword,
    changepassword,
    updateuser,
}