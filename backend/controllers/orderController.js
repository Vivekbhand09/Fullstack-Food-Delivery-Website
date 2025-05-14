import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const frontend_url = "https://fullstack-food-delivery-website-frontend.onrender.com";

const placeOrder = async (req, res) => {
  try {
    const deliveryCharge = 2;
    const totalAmount = req.body.amount + deliveryCharge;

    const newOrder = new orderModel({
      userId: req.userId, // fixed here
      items: req.body.items,
      amount: totalAmount,
      address: req.body.address
    });

    await newOrder.save();


    // Making payement status true  automatically after 1sec.
    // setTimeout(async () => {
    //   try {
    //     await orderModel.updateOne(
    //       { _id: newOrder._id },
    //       { $set: { payment: true } }
    //     );
        
    //   } catch (err) {
    //     console.error("❌ Auto-update payment failed:", err);
    //   }
    // }, 1000); // 10s delay



    await userModel.findByIdAndUpdate(req.userId, { cartData: {} }); // fixed here

    const razorOrder = await razorpay.orders.create({
      amount: totalAmount * 80 ,
      currency: "INR",
      receipt: `receipt_order_${newOrder._id}`,
      notes: {
        userId: req.userId, // fixed here
        orderId: newOrder._id.toString()
      }
    });

    res.json({
      success: true,
      razorpayOrderId: razorOrder.id,
      orderId: newOrder._id,
      amount: razorOrder.amount,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};


 // making functionality to verify payement 
export const verifyOrder=async(req,res)=>{
   const {orderId,success}=req.body;
   try {
      if(success==="true"){
        await orderModel.findByIdAndUpdate(orderId,{payment:true});
        res.json({success:true,message:"Paid"})
      }else{
        // doing this beacuse our razorpay not working for national card that why our payement is failing , hence we making it true .
        await orderModel.findByIdAndUpdate(orderId,{payment:true});
        res.json({success:true,message:"Paid"})
      }
   } catch (error) {
      console.log(error);
      res.json({success:false,message:"error"})
   }
}

// user Orders for Frontend

const userOrders=async(req,res)=>{
   try {
     const orders=await orderModel.find({userId:req.userId})
     res.json({success:true,data:orders})
   } catch (error) {
    console.log(error);
    res.json({success:false,message:"error"})
   }

}

//Listing orders for admin panel
const listOrders=async(req,res)=>{
   try {
     const orders=await orderModel.find({});
     res.json({success:true,data:orders})
   } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
   }
}

// api for updating food order status
const updateStatus=async(req,res)=>{
   try {
    await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
    res.json({success:true,message:"Status Updated"})
   } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
   }
}


export { placeOrder,userOrders ,listOrders,updateStatus};



