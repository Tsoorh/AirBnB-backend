import { loggerService } from "../../services/logger.service.js"
import { stayService } from "./stay.service.js"


// export async function getStays(req, res) {
//     const filterBy = {
//         city: req.query.city || '',
//         who: req.query.who || {},
//         dates: {
//             checkIn: req.query.checkIn,
//             checkOut: req.query.checkOut,
//         } || {}
//     }
//     try {
//         const stays = await stayService.query(filterBy)
//         res.send(stays)
//     } catch (err) {
//         loggerService.error(err)
//         res.status(400).send("Couldnt get stay")
//     }
// }

  export async function getStays(req, res) {
      const filterBy = {
          txt: req.query.txt || '',
          city: req.query.city || '',
          labels: req.query.labels
              ? (Array.isArray(req.query.labels) ? req.query.labels : [req.query.labels])
              : [],
          minPrice: req.query.minPrice ? Number(req.query.minPrice) : null,
          maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : null,
          dates: {
              checkIn: req.query.checkIn || null,
              checkOut: req.query.checkOut || null
          },
          guests: {
              adults: req.query.adults ? Number(req.query.adults) : 0,
              children: req.query.children ? Number(req.query.children) : 0,
              infants: req.query.infants ? Number(req.query.infants) : 0,
              pets: req.query.pets ? Number(req.query.pets) : 0,
          }
      }

      try {
          const stays = await stayService.query(filterBy)
          res.send(stays)
      } catch (err) {
          loggerService.error(err)
          res.status(400).send("Couldn't get stays")
      }
  }

export async function getStay(req, res) {
    const { stayId } = req.params
    try {
        const stay = await stayService.getById(stayId)
        // console.log("🚀 ~ getStay ~ stay:", stay)
        res.send(stay)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get stay")
    }
}
export async function saveStay(req, res) {
    const stay = req.body
    console.log('update stay', stay);
    

    try {
        let stayRes;
        console.log("🚀 ~ saveStay ~ _id:", Boolean(stay._id))
        console.log("🚀 ~ saveStay ~ _id:", stay._id)
        if (stay._id) {
            stayRes = await stayService.update(stay)
        } else {
            stayRes = await stayService.add(stay)
        }
        res.send(stayRes)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get stay")
    }
}
export async function removeStay(req, res) {
    const { stayId } = req.params
    try {
        const removedId = await stayService.remove(stayId)
        res.send(removedId)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send("Couldnt get stay")
    }
}