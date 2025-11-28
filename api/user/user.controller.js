import { loggerService } from "../../services/logger.service.js";
import { UserService } from "./user.service.js";
import { stayService } from "../stay/stay.service.js";

export async function getUsers(req,res) {
    const filterBy = {
        txt:req.query.txt||'',
        isAdmin:req.query.isAdmin||null,
        isHost
    }
    try {
        const users = await UserService.query(filterBy);
        res.send(users);
    } catch (err) {
        loggerService.error(err);
        res.status(400).send("Couldn't get users")
    }
}

export async function getUser(req,res) {
    try {
        const {userId} = req.params;      
        const user = await UserService.getById(userId);
        res.send(user);
    } catch (err) {
        loggerService.error(err);
        res.status(400).send("Couldn't get user id")
    }    
}

export async function saveUser(req,res){
    const user = req.body
    try {
        let userRes;
        if(user._id){
            userRes = await UserService.update(user);
        }else{
            user.isAdmin =false
            userRes = await UserService.add(user);
        }
        res.send(user);
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldn't save user");
    }
}

export async function removeUser(req,res) {
    try {
        const {userId} =req.params;
        await UserService.remove(userId);
        res.send(userId);
    } catch (err) {
        loggerService.error(err);
        res.status(400).send("Couldn't remove user");
    }
    
}

export async function getUserStays(req,res){
    const {userId:ownerId} = req.params
    try {
        const userExist = await UserService.getById(userId);
        if(!userExist) throw new Error("Couldn't find user")
        
        const filterBy = {ownerId}
        const stays = await stayService.query(filterBy)
        
        return stays
        } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get user's stays")
    }
}