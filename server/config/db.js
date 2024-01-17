import mongoose from "mongoose";

// dont give me error if i have asked any extra info
mongoose.set('strictQuery',false)


const connectiondatabase=async()=>
{
    try{
        const {connection}= await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms');
        if(connection){
            console.log("connected to mongo db database")}
    }catch(e){
        console.log(e.message);
        // exit kr jao if database is not connected
        process.exit(1);
    }
}

export default connectiondatabase;



