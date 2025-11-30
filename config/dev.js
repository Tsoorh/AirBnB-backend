import dotenv from 'dotenv';
dotenv.config();

export default{
    dbURL: process.env.MONGO_URL || "mongodb://localhost:27017",
    dbName: process.env.DB_NAME || "airbnb_db"
}