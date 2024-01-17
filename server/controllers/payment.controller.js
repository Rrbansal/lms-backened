import User from '../models/user.model.js';
import apperror from '../utils/error.util.js';
import { razorpay } from '../server.js';
import crypto from 'crypto'
import Payment from '../models/payment.model.js'

const getrazorpaykey=async(req,res,next)=>
{
    try{
        res.status(200).json(
            {
                success:true,
                message:"razor pay api key",
                key:process.env.RAZORPAY_KEY_ID,
            })
    }catch(e)
    {
        return next(new apperror(e.message,400));
    }
}

const buysubscription=async(req,res,next)=>
{
    try{
        const {id}=req.user;
        const user=await User.findById(id);
        if(!user)
        {
            return next(new apperror('user not found',400));
        }
        if(user.userrole==='ADMIN')
        {
            return next(new apperror('admin cannot buy course',400));
        }

        const subscription=await razorpay.subscriptions.create(
            {
                plan_id:process.env.RAZORPAY_PLAN_ID,
                customer_notify:1
            }
        )
        user.subscription.id=subscription.id;
        user.subscription.status=subscription.status;

        await user.save();
        res.status(200),json(
            {
                success:true,
                message:'subscribed successfully',
                subscription_id:subscription.id,
            })
    }catch(e)
    {
        return next(new apperror(e.message,400));
    }
}

const verifysubscription=async(req,res,next)=>
{
    try{
        const {id}=re.user;
        const {razor_payment_id,razorpay_signature,razorpay_subscription_id}=req.body;
        const user=await User.findById(id);
        if(!user)
        {
            return next(new apperror('user not found',400));
        }

        const subscriptionid=user.subscription.id;
        const generatedsignature=crypto.createHmac('sha256',process.env.RAZORPAY_SECRET)
        .update(`${razor_payment_id}|${subscriptionid}`)
        .digest('hex');

        if(generatedsignature!==razorpay_signature)
        {
            return next(new apperror('payment not verified',400));
        }

        await Payment.create(
            {
                razorpay_payment_id,
                razorpay_signature,
                razorpay_subscription_id
            })

        user.subscription.status='active';

        await user.save();
        res.status(200).json(
            {
                success:true,
                message:'payment created sucessfully'
            }
    )
    }catch(e)
    {
        return next(new apperror(e.message,400));
    }
}


const cancelsubscription=async(req,res,next)=>
{
    try{
        const {id}=req.user;
        const user=await User.findById(id);
        if(!user)
        {
            return next(new apperror('user not found',400));
        }
        if(user.userrole==='ADMIN')
        {
            return next(new apperror('admin cannot buy course',400));
        }
        const subscriptionid=user.subscription.id;
        const subscription=await razorpay.subscriptions.cancel(
            {
                subscriptionid
            }
        )
        user.subscription.status=subscription.status;
        await user.save();
    }catch(e)
    {
        return next(new apperror(e.message,400));
    }
}
const allpayments=async(req,res,next)=>
{
    const {count,skip}= req.query;

    const allPayments=await razorpay.subscriptions.all(
        {
            count:count | 10,
            skip:skip | 0,
        }
    )

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const finalMonths = {
        January: 0,
        February: 0,
        March: 0,
        April: 0,
        May: 0,
        June: 0,
        July: 0,
        August: 0,
        September: 0,
        October: 0,
        November: 0,
        December: 0,
      };

      const monthlyWisePayments = allPayments.items.map((payment) => {
        const monthsInNumbers = new Date(payment.start_at * 1000);
    
        return monthNames[monthsInNumbers.getMonth()];
      });

      monthlyWisePayments.map((month) => {
        Object.keys(finalMonths).forEach((objMonth) => {
          if (month === objMonth) {
            finalMonths[month] += 1;
          }
        });
      });
    
      const monthlySalesRecord = [];
    
      Object.keys(finalMonths).forEach((monthName) => {
        monthlySalesRecord.push(finalMonths[monthName]);
      });
    
      res.status(200).json({
        success: true,
        message: 'All payments',
        allPayments,
        finalMonths,
        monthlySalesRecord,
      });




}

export{
    getrazorpaykey,
    buysubscription,
    verifysubscription,
    cancelsubscription,
    allpayments
}
