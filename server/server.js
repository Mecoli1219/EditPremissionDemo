import WebSocket from 'ws'
import mongoose from 'mongoose';
import http from 'http';
import dotenv from "dotenv-defaults"
import express from 'express';
import Frame from "./models/frame"
import Account from './models/account';
import {sendData, sendStatus, initData} from "./wssConnect"

dotenv.config();

mongoose.connect(
    process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((res)=>console.log("mongo db connection created"))
const app = express();
const server = http.createServer(app)
const wss = new WebSocket.Server({server})
const db = mongoose.connection
const PORT = process.env.PORT || 4000

const boardcastMessage = (data, status) => {
    wss.clients.forEach((client) => {
        sendData(data, client);
        sendStatus(status, client);
    }) 
}

db.once('open', () => {
    wss.on('connection', (ws) => {
        initData(ws)
        ws.onmessage = async (byteString) => {
            const {data} = byteString
            const [task, payload] = JSON.parse(data)
            switch(task){
                case 'add-request': {
                    const {start} = payload
                    const frame = new Frame({start, data: "init", editing: true})
                    console.log(frame)
                    try {
                        await frame.save()
                    } catch (e) {
                        throw new Error('Frame DB save Error: ' + e)
                    }
                    // sendData(['output', [payload]], ws)
                    // sendStatus({
                    //     type: 'success',
                    //     msg: 'Message sent.'
                    // }, ws)
                    boardcastMessage(['add', [payload]], {
                        type: 'success',
                        msg: 'Frame generate.'
                    })
                    break
                }
                case 'clear': {
                    Frame.deleteMany({}, () => {
                        boardcastMessage(['cleared'], {
                            type:'info',
                            msg: 'Message cache cleared.'
                        })
                        // sendData(['cleared'], ws)
                        // sendStatus({type:'info', msg: 'Message cache cleared.'}, ws)
                    })
                    break
                }
                case 'clear account': {
                    Account.deleteMany({}, () => {
                        boardcastMessage(['account cleared'], {
                            type:'info',
                            msg: 'Account cache cleared.'
                        })
                    })
                    break
                }
                case 'sign in': {
                    const {name} = payload
                    const user = await Account.findOne({name})
                    if(user){
                        sendData(["signIn", user.password], ws)                        
                    }else{
                        sendData(["signIn", "Fail"], ws)
                        sendStatus({
                            type: 'error',
                            msg: 'User not found!'
                        }, ws)
                    }
                    break
                }
                case 'sign up': {
                    const {name, password} = payload
                    const findUser = await Account.findOne({name})
                    if (findUser){
                        sendStatus({
                            type: "error",
                            msg: "User already exists!"
                        }, ws)
                    }else{
                        const user = new Account({name, password})
                        try {
                            await user.save()
                        } catch (e) {
                            throw new Error('Message DB save Error: ' + e)
                        }
                        sendStatus({
                            type: "success",
                            msg: "User account created."
                        }, ws)
                    }
                    break
                } 
                default: break
            }
        }
    })
    server.listen(PORT, () =>{
        console.log(`Example app listening on port ${PORT}!`)
    })
})
