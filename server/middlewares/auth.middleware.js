import apperror from "../utils/error.util.js";
import jwt from 'jsonwebtoken'

const isloggedIn=async(req,res,next)=>
{
    const { token } = req.cookies;

  // If no token send unauthorized message
  if (!token) {
    return next(new apperror("Unauthorized, please login to continue", 401));
  }

  // Decoding the token using jwt package verify method
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // If no decode send the message unauthorized
  if (!decoded) {
    return next(new apperror("Unauthorized, please login to continue", 401));
  }

  // If all good store the id in req object, here we are modifying the request object and adding a custom field user in it
  req.user = decoded;

  // Do not forget to call the next other wise the flow of execution will not be passed further
  next();

}

const authorizationROLES = (...roles) =>async (req, res, next) => {
    if (!roles.includes(req.user.userrole)) {
      return next(new apperror("You do not have permission to view this route", 403));
    }

    next();
  };

  const authorizationsubs=async(req,res,next)=>
  {
    const subscription=req.user.subscription;
    const usercurrentrole=req.user.userrole;
    if(usercurrentrole !=='ADMIN' && subscription.status!=='active')
    {
      return next(new apperror('please subscribe',400));
    }
    next();
  }

export 
{
    isloggedIn,
    authorizationROLES,
    authorizationsubs
}