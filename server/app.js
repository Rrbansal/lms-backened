import express from 'express'
import cors from 'cors';
import cookieParser  from 'cookie-parser';
import {config} from 'dotenv';
config();
import userRoutes from './routes/user.routes.js'
import morgan from 'morgan';
import courseRoutes from './routes/course.routes.js'
import paymentroutes from './routes/payment.routes.js'

import errorMiddleware from './middlewares/error.middleware.js'
// import miscRoutes from './routes/miscellaneous.routes.js'
import miscRoutes from './routes/miscellaneous.routes.js'

const app=express();


// all data should be json format
app.use(express.json());

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    // credentials can move from one port to another
    credentials:true,
})
);

app.use(cookieParser());

// to parse urls
app.use(express.urlencoded({extended:true}));

// to get the log of requests of development level
app.use(morgan('dev'));

// this is just to cehck whther ur server is up or not
app.use('/ping',(req,res)=>
{
    res.send('pong');

})


app.use('/api/v1/user',userRoutes);
app.use('/api/v1/courses',courseRoutes);
app.use('/api/v1/payments',paymentroutes);
app.use('/api/v1', miscRoutes);

// if someone hits any / which is not defined
app.all('*', (req, res) => {
    res.status(404).send('OOPS!!! 404 Page Not Found');
});

// generic error handling
app.use(errorMiddleware);

  
export default app;