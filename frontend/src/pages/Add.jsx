import { useContext, useEffect, useMemo, useState } from "react";
import Input from '../components/Input'
import Button from '../components/Button'
import toast from "react-hot-toast";
import axios from "axios";
import { API_PATHS } from "../utils/apiPath";
import { AuthContext } from "../context/context";
import { useNavigate } from "react-router-dom";
export default function Add(){
    const [name,setName] = useState('')
    const [category,setCategory] = useState('other')
    const [quantity,setQuantity] = useState(1)
    const [expiryDate,setExpiryDate] = useState('')
    const [loading,setLoading] = useState(false)

    const {token} = useContext(AuthContext)
    const navigate = useNavigate()
    const authHeader = useMemo(
        () => ({headers:{Authorization:`Bearer ${token}`}}),
        [token]
    )

    useEffect(()=>{
        if(!token){
            navigate('/login');
        }
    },[token,navigate])


    const addItem = async(e) =>{
        e.preventDefault()
        if(!name.trim() || !category || !quantity || !expiryDate){
            toast.error('Missing required fields');
            return;
        }

        try{
            setLoading(true)
            await axios.post(API_PATHS.ITEM.CREATE,{
                name:name.trim(),
                category,
                quantity:Number(quantity),
                expiryDate
            },authHeader)
            toast.success("Item added successfully")
            navigate('/items')
        }catch(err){
            toast.error(err.response?.data?.message || err.message)
        }finally{
            setLoading(false)
        }
    }

    return(
        <div className="w-screen h-screen flex items-center justify-center">
            <form onSubmit={addItem} className="max-w-6xl p-4 space-y-3 flex flex-col border-2 border-black rounded-lg">
                <Input label={"Name"} type={"text"} placeholder={"Enter item name"} value={name} onChange={e=>setName(e.target.value)} />
                <label className="text-lg font-medium">Category</label> 
                <select value={category} onChange={e=>setCategory(e.target.value)} className="p-2 border-black border-2 rounded-xl focus:outline-none">
                    <option value="produce">Produce</option>
                    <option value="dairy">Dairy</option>
                    <option value="meat">Meat</option>
                    <option value="pantry">Pantry</option>
                    <option value="frozen">Frozen</option>
                    <option value="other">Other</option>
                </select>  
                <Input label={"Quantity"} type={"number"} placeholder={"Enter quantity"} value={quantity} onChange={e=>setQuantity(e.target.value)} /> 
                <Input label={"Expiry Date"} type={"date"} placeholder={"Enter expiry date"} value={expiryDate} onChange={e=>setExpiryDate(e.target.value)} />
                <Button type={"submit"} disabled={loading}>{loading ? "Adding..." : "Add Item"}</Button>
            </form>
        </div>
    )
}
