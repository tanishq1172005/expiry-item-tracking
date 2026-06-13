import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button"
import axios from 'axios'
import {API_PATHS} from '../utils/apiPath'
import {Link, useNavigate} from 'react-router-dom'
import toast from "react-hot-toast";

export default function Register(){
    const [name,setName] = useState('')
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')

    const navigate = useNavigate()

    const handleRegister=async(e)=>{
        e.preventDefault()
        if(!name.trim || !email.trim || !password.trim){
            toast.error("Missing required fields")
        }
        try{
            const res = await axios.post(API_PATHS.AUTH.REGISTER,{name,email,password})
            if(res.data){
                toast.success('User registered succesfully')
                navigate('/login')
            }
            
        }catch(err){
            toast.error(err)
        }
    }

    return(
    <div className="flex items-center justify-center flex-col w-screen h-screen space-y-3">
        <h1 className="font-semibold text-2xl ">Create Account</h1>
        <p className="text-sm font-medium text-gray-800">Enter your details to enter the platform</p>
        <form onSubmit={handleRegister} className="flex flex-col gap-5 border-2 border-black p-6 rounded-lg">
            <Input label={"Name"} type={"text"} placeholder={"John Doe"} value={name} onChange={e=>setName(e.target.value)} />
            <Input label={"Email"} type={"text"} placeholder={"Johndoe@email.com"} value={email} onChange={e=>setEmail(e.target.value)} />
            <Input label={"Password"} type={"password"} placeholder={"*******"} value={password} onChange={e=>setPassword(e.target.value)} />
            <Button type={"submit"}>Sign Up</Button>
            <p className="text-xs text-slate-500">Already have an account? <Link to={'/login'} className="text-blue-500 text-xs cursor-pointer">Login</Link></p>
        </form>
        
    </div>
    )
}