export async function requireAuth(req,res,next) {
    if(!req.cookies.loginToken) return res.status(401).send("Please login!")

    next()
}