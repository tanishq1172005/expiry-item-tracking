import Login from "./pages/Login";
import Register from "./pages/Register";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import {Toaster} from 'react-hot-toast'
import Household from "./pages/Household";
import Items from "./pages/Items";
import Add from "./pages/Add";
import Dashboard from "./pages/Dashboard";
export default function App(){
    return(
    <>
    <Router>
      <Routes>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<Household/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/items" element={<Items/>}/>
        <Route path="/add" element={<Add/>}/>
      </Routes>
    </Router>
    <Toaster/>
    </>)
}
