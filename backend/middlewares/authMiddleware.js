import jwt from 'jsonwebtoken'

export const authMiddleware = (req,res,next)=>{
    try{
        const header = req.headers.authorization;
        if(!header || !header.startsWith("Bearer ")){
            return res.status(401).json({message:'Access denied. No token provided'})
        }
        const token = header.split(' ')[1]
        const decoded = jwt.verify(token,'tanishq123')
        req.userId = decoded.id
        next()
    }catch(err){
        return res.status(401).json({message:'Invalid or expired token'})
    }
}