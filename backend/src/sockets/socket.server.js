const { Server} = require("socket.io");
const cookie = require("cookie")
const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const aiService = require("../services/ai.service")
const messageModel = require("../models/message.model")
const {createMemory,queryMemory} = require("../services/vector.service")


 function initSocketServer(httpServer){
    const io = new Server(httpServer,{
        cors:{
            origin:"http://localhost:5173",
            allowedHeaders:["Content-Type","Authorization"],
            methods: ["GET", "POST"],
            credentials:true,
        }
    });

    io.use(async(socket,next)=>{
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if(!cookies.token){
        next(new Error("Authentication error: no token provided"))
    }


    try {
        
        const decoded = jwt.verify(cookies.token,process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.id)

        socket.user = user
        next();

    } catch (err){
        next(new Error("Authentication errror: Invalid Token"))
    }

    })

    io.on("connection",(socket)=>{

        socket.on("ai-message",async (messagePayload)=>{

         /*   
         const message =   await messageModel.create({
                chat:messagePayload.chat,
                user:socket.user._id,
                content:messagePayload.content,
                role:"user"
            })

            const vectors = await aiService.generateVector(messagePayload.content)

            below code starts executing all at same time rather than completion of one after another because they are not depedent on each other(block 2)
            */

            // block 1
            const [message,vectors] = await Promise.all([
                messageModel.create({
                    chat:messagePayload.chat,
                    user:socket.user._id,
                    content:messagePayload.content,
                    role:"user"
                }),

                aiService.generateVector(messagePayload.content),
            ])

            
            /*
            const memory  = await queryMemory({
                queryVector:vectors,
                limit:3,
                metadata:{
                    user:socket.user._id
                }

            })
                it is moved to (block-2)
            */

            await createMemory({
                vectors,
                messageId:message._id,
                metadata:{
                    chat:messagePayload.chat,
                    user:socket.user._id,
                    text:messagePayload.content
                }
            }) 

            /* 
            const chatHistory = (await messageModel.find({
                chat:messagePayload.chat
            }).sort({createdAt: -1}).limit(20).lean()).reverse()

            it is moved to (block-2)
            */

            // block 2
            const [memory , chatHistory ] = await Promise.all([
                queryMemory({
                    queryVector:vectors,
                    limit:3,
                    metadata:{
                        user:socket.user._id
                    }
                }),
                messageModel.find({
                chat:messagePayload.chat
                }).sort({createdAt: -1}).limit(20).lean().then(messages => messages.reverse())

            ])

            const stm = chatHistory.map(item=>{
                return{
                    role:item.role,
                    parts:[{ text:item.content }]
                }
            })

            const ltm = [
                {
                    role:"user",
                    parts:[{text:`
                        these are some previous messages from the chat, use them to generate a  response

                        ${memory.map(item=>item.metadata.text).join("\n")}
                        `}]
                }
            ]


            const response = await aiService.generateResponse([ ...ltm, ...stm])

            /*
            const responseMessage =  await messageModel.create({
                chat:messagePayload.chat,
                user:socket.user._id,
                content:response,
                role:"model"
            })

            const responseVectors = await aiService.generateVector(response)
            
            both moved to (block-3)
            */


            socket.emit("ai-response",{
                content:response,
                chat:messagePayload.chat
            })

                    // block 3
            const [responseMessage , responseVectors] = await Promise.all([
                messageModel.create({
                chat:messagePayload.chat,
                user:socket.user._id,
                content:response,
                role:"model"
                }),

                aiService.generateVector(response)
            ])


            await createMemory({
                vectors:responseVectors,
                messageId:responseMessage._id,
                metadata:{
                    chat:messagePayload.chat,
                    user:socket.user._id,
                    text:response,
                }
            })
            
        })
    })


}

module.exports = initSocketServer; 