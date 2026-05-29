import mongoose from "mongoose";

export const connectDB = async()=>{
    await mongoose
      .connect(
        process.env.MONGODB_URI
      )
      .then(() => console.log("Connected"))
      .catch((err) => console.error(err));
}