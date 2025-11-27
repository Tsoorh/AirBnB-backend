import { loggerService } from "../../services/logger.service.js";
import { UserService } from "./user.service.js";

export async function getUsers(req,res) {
    try {
        const users = await UserService.query();
        res.send(users);
    } catch (err) {
        loggerService.error(err);
        res.status(400).send("cannot get users")
    }
}

export async function getUser(req,res) {
    try {
        const {userId} = req.params;      
        console.log("🚀 ~ getUser ~ userId:", userId)
        const user = await UserService.getById(userId);
        res.send(user);
    } catch (err) {
        loggerService.error(err);
        res.status(400).send("Cannot get user id")
    }    
}

export async function saveUser(req,res){
    try {
        console.log(req.body)
        const user = await UserService.save(req.body);
        res.send(user);
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Cannot save user");
    }
}

export async function removeUser(req,res) {
    try {
        const {userId} =req.params;
        await UserService.remove(userId);
        res.send(`Removed successfully, user Id - ${userId}`);
    } catch (err) {
        loggerService.error(err);
        res.status(400).send(`Cannot remove user `);
    }
    
}