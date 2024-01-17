import { Schema,model } from "mongoose"; 
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import crypto from 'crypto'

const userschema= new Schema({
        fullname:
        {
            type:'String',
            required:[true,"name is required"],
            minLength:[5,"name must be atleast 5 characters"],
            maxLength:[50,"name should be less than 50 characters"],
            lowercase:true,
            trim:true
        },
        email:
        {
            type:'String',
            required:[true,"email is required"],
            lowercase:true,
            trim:true,
            unique:true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please fill in a valid email address',
              ]
              // regex for email validator
        },
        password:
        {
            type:'String',
            required:[true,"password should be provided"],
            minLength:[8," password should be of atleast  8 characters"],
            select:false,
        },
        avatar:
        {
            public_id:
            {
                type:'String',
            },
            secure_url:
            {
                type:'String'
            }
        },
        userrole:
        {
            type:'String',
            enum:['USER','ADMIN'],
            default:'USER',
        },
        forgotpasswordtoken:
        {
            type:'String'
        },
        forgotpasswordexpiry:
        {
            type:'Date',
        },
        subscription:
        {
            id:String,
            status:String
        }
    },
    {
        timestamps:true
    }
);


userschema.pre("save",async function(next)
{
    if(!this.isModified('password'))
    {
        return next();
    }
    this.password= await bcrypt.hash(this.password,10);
});


userschema.methods=
{
    generateJWTToken:async function()
    {
        return await jwt.sign(

            {id:this._id,userrole:this.userrole,subscription:this.subscription},
            process.env.JWT_SECRET,
            {expiresIn:'7d'}
        )
    },
    comparePasswod:async function(plaintextpassword)
    {
        return await bcrypt.compare(plaintextpassword,this.password)
    },
    generatePassResetToken:async function()
    {
        const resettoken=crypto.randomBytes(20).toString('hex');
         this.forgotpasswordtoken=crypto.createHash('sha256').update(resettoken).digest('hex');
         this.forgotpasswordexpiry= Date.now() + 20 * 60 * 1000; // 15 mint from now
         return resettoken
    }
}



const user= model('User',userschema);

export default user;