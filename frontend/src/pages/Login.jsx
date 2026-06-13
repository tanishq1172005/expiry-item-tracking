import { useContext, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button"
import axios from 'axios'
import {API_PATHS} from '../utils/apiPath'
import {Link, useNavigate} from 'react-router-dom'
import toast from "react-hot-toast";
import { AuthContext } from "../context/context";

export default function Login(){
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const {setToken} = useContext(AuthContext)

    const navigate = useNavigate()

    const handleLogin=async(e)=>{
        e.preventDefault()
         if(!email.trim() || !password.trim()){
            toast.error("Missing required fields")
            return;
        }
        try{
            const res = await axios.post(API_PATHS.AUTH.LOGIN,{email,password})
            const token = res.data.token
            localStorage.setItem("token",token)
            setToken(token)
            toast.success("Logged in succesfully")
            navigate('/')
        }catch(err){
            toast.error(err.response?.data?.message || err.message)
        }
    }

    return(
    <div className="flex items-center justify-center flex-col w-screen h-screen space-y-3">
        <h1 className="font-semibold text-2xl ">Welcome Back</h1>
        <p className="text-sm font-medium text-gray-800">Enter your details to enter the platform</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-5 border-2 border-black p-6 rounded-lg">
            <Input label={"Email"} type={"text"} placeholder={"Johndoe@email.com"} value={email} onChange={e=>setEmail(e.target.value)} />
            <Input label={"Password"} type={"password"} placeholder={"*******"} value={password} onChange={e=>setPassword(e.target.value)} />
            <Button type={"submit"}>Sign Up</Button>
            <p className="text-xs text-slate-500">Don't have an account? <Link to={'/register'} className="text-blue-500 text-xs cursor-pointer">Sign Up</Link></p>
        </form>
        
    </div>
    )
}
