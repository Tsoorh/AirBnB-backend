
import { asyncLocalStorage } from "../services/als.service"

export async function ownerOnly(req,res,next) {
    const {loggedinUser} =await asyncLocalStorage.getStore()
    res.status(401).send('No permission!')
}