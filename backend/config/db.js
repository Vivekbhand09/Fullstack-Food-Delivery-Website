import mongoose from "mongoose";

export const connectDB=async()=>{
    await mongoose.connect('mongodb+srv://Vivek2712:Vivekbhand09@cluster0.9hewxbx.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}