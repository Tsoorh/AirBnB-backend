import { authService } from "../api/auth/auth.service.js"

export async function adminOnly(req,res,next) {
    
    if (!req.cookies.loginToken) return res.status(401).send('please Login!')
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if(!loggedinUser.isAdmin) res.status(403).send('No permission!')

    next()
}