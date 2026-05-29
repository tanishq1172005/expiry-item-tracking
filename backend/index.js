import express from "express";
import { connectDB } from "./db/db.js";
import dotenv from 'dotenv'
import { checkExpiry } from "./utils/checkExpiry.js";
import cors from 'cors'

dotenv.config({
  path:'./.env'
})

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  {
    origin:'*'
  }
))

connectDB()
checkExpiry()

const port = process.env.PORT || 3000;

import userRouter from './routes/userRoute.js'
app.use('/api/auth',userRouter)

import householdRouter from './routes/householdRoute.js'
app.use('/api/households',householdRouter)

import itemRouter from './routes/itemRoute.js'
app.use('/api/items',itemRouter)

import dashboardRouter from './routes/dashboardRoute.js'
app.use('/api/dashboard',dashboardRouter)

app.listen(port,()=>{
  console.log(`Listening on port :${port}`)
})
