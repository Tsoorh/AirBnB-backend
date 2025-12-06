// import dotenv from 'dotenv';
// dotenv.config();


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { setupAsyncLocalStorage } from "./middlewares/setupAls.middleware.js";
import path from 'path';
import { createServer } from "http";
import { socketService } from "./services/socket.service.js";


const app = express();
const httpServer = createServer(app)

// **************config****************
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://airbnb-frontend-YOUR-APP.onrender.com"
  ],
  credentials: true,
};

// middlewares
app.use(express.static('public'));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.set('query parser', 'extended');
app.use(setupAsyncLocalStorage)

//api routing
import { stayRoutes } from "./api/stay/stay.routes.js";
import { authRoutes } from "./api/auth/auth.routes.js";
import { userRoutes } from "./api/user/user.routes.js";
import { orderRoutes } from "./api/order/order.routes.js";
import { reviewRoutes } from "./api/review/review.routes.js";
import { chatRoutes } from "./api/chat/chat.route.js";
import { messageRoutes } from "./api/message/message.route.js";

app.use("/api/auth", authRoutes)
app.use("/api/stay", stayRoutes)
app.use("/api/user", userRoutes)
app.use("/api/order", orderRoutes)
app.use("/api/review", reviewRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/message", messageRoutes)


// socketService.setupSocketAPI(httpServer,corsOptions)

// * For SPA (Single Page Application) - catch all routes and send to the index.html
app.get('/*all', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

socketService.setupSocketAPI(httpServer,corsOptions);

const port = process.env.PORT || 3030
httpServer.listen(port, () => console.log(`Server ready at port ${port}`));


// for package.json -> script:  // "start": "set PORT=3030 & nodemon --ignore \"./data\" server.js"