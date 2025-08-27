const mongoose = require("mongoose");

async function connectDB() { 
    try{
        await mongoose.connect(process.env.MONGO_URI)

        console.log("Connected to Mongodb")
    }catch(err){
        console.error("error connecting to Mongodb",err)
    }
}

module.exports = connectDB;