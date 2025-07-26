import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./database/db.js";
import Razorpay from 'razorpay'
import cors from 'cors'

dotenv.config();

export const instance = new Razorpay({
    key_id: process.env.Razorpay_Key,
    key_secret: process.env.Razorpay_Secret,
})


const app = express ()

const port = process.env.PORT;

app.get('/',(req,res)=>{
    res.send("Server is working");
});

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static("uploads"));

// importing routes
import userRoutes from "./routes/user.routes.js"
import courseRoutes from "./routes/course.routes.js"
import adminRoutes from "./routes/admin.routes.js"


//using routes
app.use('/api',userRoutes);
app.use('/api',courseRoutes);
app.use('/api',adminRoutes)

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
    connectDB()
})