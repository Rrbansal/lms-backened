import {model,Schema} from 'mongoose';

const paymentschema=new Schema(
    {
        razorpay_payment_id:
        {
            type:String,
            required:true,
        },
        razorpay_subscription_id:
        {
            type:String,
            required:true,
        },
        razorpay_signature:
        {
            type:String,
            required:true,
        }

    },
    {
        timestamps:true
    }
)

const payment = model('payment',paymentschema);
 export default payment;