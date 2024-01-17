import {Schema,model} from 'mongoose'


const courseschema=new Schema({
        title:
        {
            type:String,
            required:[true,'title is required'],
            minLength:[5,'title should be of minimum 5 are required'],
            maxLength:[50,'title should be of maximum should be 50 characters'],
            trim:true,
            
        },
        description:
        {
            type:String,
            required:[true,'description is required'],
            minLength:[5,'description should be of minimum 5 are required'],
            maxLength:[200,'description should be of maximum should be 200 characters'],
            trim:true,
        },
        category:
        {
            type:String,
            required:true,
        
        },
        thumbnail:
        {
            public_id:
                {
                    type:String,
                     required:true,
                },
                secure_url:
                {
                    type:String,
                     required:true,
                }

        },
        lectures:[
        {
            title:String,
            description:String,
            lecture:
            {
                public_id:
                {
                    type:String,
                    // required:true,
                },
                secure_url:
                {
                    type:String,
                    // required:true,
                }
            }
        }],
        nooflectures:
        {
            type:Number,
            default:0,
        },
        createdby:
        {
            type:String,
            required:true,
        }
    },
    {
        timestamps:true,
    }
)

const course=model("course",courseschema);

export default course;