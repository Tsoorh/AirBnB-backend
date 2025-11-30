import { loggerService } from "../../services/logger.service.js"
import { orderService } from "./order.service.js"


export async function getOrders(req, res) {
    const filterBy = {
        hostId: req.query.hostId || '',
        guestId: req.query.guestId || '',
        status: req.query.status || '',
        stayId: req.query.stayId || ''
    }
    try {
        const orders = await orderService.query(filterBy)
        res.send(orders)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get order")
    }
}
export async function getOrder(req, res) {
    const { orderId } = req.params
    try {
        const order = await orderService.getById(orderId)
        res.send(order)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get order")
    }
}
export async function saveOrder(req, res) {
    const order = req.body

    try {
        let orderRes;
        if (order._id) {
            orderRes = await orderService.update(order)
        } else {
            orderRes = await orderService.add(order)
        }
        res.send(orderRes)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get order")
    }
}
export async function removeOrder(req, res) {
    const { orderId } = req.params
    try {
        const removedId = await orderService.remove(orderId)
        res.send(removedId)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get order")
    }
}