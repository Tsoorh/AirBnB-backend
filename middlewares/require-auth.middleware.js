export async function requireAuth(req,res,next) {
    if(!req.cookies.loginToken) res.status(401).send("Please login!")

    next()
}