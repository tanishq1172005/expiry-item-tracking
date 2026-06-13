import { AuthContext } from "./context";
import { useState } from "react";

export function AuthProvider({children}){
    const [token,setToken] = useState(localStorage.getItem("token"))
    
    return <AuthContext.Provider value={{token,setToken}}>
        {children}
    </AuthContext.Provider>
}
