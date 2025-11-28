import { loggerService } from "../../services/logger.service.js"
import { stayService } from "./stay.service.js"


export async function getStays(req, res) {
    const filterBy = {
        city: req.query.city || '',
        who: req.query.who || {},
        dates: {
            checkIn: req.query.checkIn,
            checkOut: req.query.checkOut,
        } || {}
    }
    try {
        const stays = await stayService.query(filterBy)
        return stays
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get stay")
    }
}
export async function getStay(req, res) {
    const { stayId } = req.params
    try {
        const stay = await stayService.getById(stayId)
        return stay
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get stay")
    }
}
export async function saveStay(req, res) {
    const stay = req.body
    try {
        let stayRes;
        if (stay._id) {
            stayRes = await stayService.update(stay)
        } else {
            stayRes = await stayService.add(stay)
        }
        return stayRes
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get stay")
    }
}
export async function removeStay(req, res) {
    const { stayId } = req.params
    try {
        const removedId = await stayService.remove(stayId)
        return removedId
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get stay")
    }
}