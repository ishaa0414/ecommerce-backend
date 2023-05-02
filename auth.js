import jwt from 'jsonwebtoken'
export const auth=(req,res,next)=>{
    try {
        const token=req.header('x-auth-token');
        jwt.verify(token,"MySecret");
        next();
    } catch (error) {
        res.send(error.message)
    }
}