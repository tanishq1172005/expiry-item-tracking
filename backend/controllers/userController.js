import { User } from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, "tanishq123");
};

export const signup = async(req,res) => {
    try {
    const { name, email, password } = req.body;
    if(!password || !email || !name){
      return res.status(400).json({message:'Missing required fields'})
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.status(200).json({ message: "User created succesfully", user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
}

export const login = async(req,res)=>{
    try {
    const { email, password } = req.body;
    if(!email || !password){
      return res.status(400).json({message:'Missing required fields'})
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    return res
      .status(201)
      .json({ email: user.email, password: user.password, token: token });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
}