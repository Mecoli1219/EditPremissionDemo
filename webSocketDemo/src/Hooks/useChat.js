import { useState } from "react";
import bcrypt from "bcryptjs"

const saltRounds = 10;

const client = new WebSocket('ws://localhost:4000')
const useChat = () => {
    const [editing, setEditing] = useState(null);
    const [key, setKey] = useState(0)
    const [frames, setFrames] = useState([]);
    const [status, setStatus] = useState({});
    const [signedIn, setSignedIn] = useState(false)
    const [passwordCache, setPasswordCache] = useState("")
    

    client.onmessage = async (byteString) => {
        const {data} = byteString;
        const [task, payload] = JSON.parse(data)
        switch (task) {
            case "init": {
                setFrames(()=> payload)
                break
            }
            case "add": {
                const {start, data, index} = payload
                const newEditing = payload.editing
                setFrames(()=>[...frames.slice(0, index), {start, editing:newEditing, data}, ...frames.slice(index)])
                setEditing(index)
                console.log(index)
                setKey(index*1+"")
                break
            }
            case "add-all": {
                const {start, data, index} = payload
                const newEditing = payload.editing
                setFrames(()=>[...frames.slice(0, index), {start, editing:newEditing, data}, ...frames.slice(index)])
                if(editing >= index){
                    setEditing(editing+1)
                    setKey((key*1+1)+"")
                }
                break
            }
            case "cancel": {
                const {index} = payload
                setFrames(()=>[...frames.slice(0, index), {...frames[index], editing: ""}, ...frames.slice(index+1)])
                break
            }
            case "edit": {
                const {index, user} = payload
                setEditing(parseInt(index, 10))
                setFrames(()=>[...frames.slice(0, index), {...frames[index], editing: user}, ...frames.slice(index+1)])
                break
            }
            case "edit-all": {
                const {index, editing} = payload
                setFrames(()=>[...frames.slice(0, index), {...frames[index], editing}, ...frames.slice(index+1)])
                break
            }
            case "done": {
                const {index, data} = payload
                setFrames(()=>[...frames.slice(0, index), {...frames[index], editing: "", data}, ...frames.slice(index+1)])
                break
            }
            case "status": {
                setStatus(payload)
                break
            }
            case "cleared": {
                setFrames([])
                break
            }
            case "account cleared": {
                break
            }
            case "signIn": {
                if (payload !== "Fail"){
                    const check = await bcrypt.compare(passwordCache, payload)
                    if (check){
                        setSignedIn(true)
                        setPasswordCache("")
                        setStatus({
                            type: 'success',
                            msg: 'Log In.'
                        })
                    }else{
                        setSignedIn(false)
                        setStatus({
                            type: 'error',
                            msg: 'Wrong password!'
                        })
                    }
                }else{
                    setSignedIn(false)
                }
                break
            }
            default: break
        }
    }
    const sendData = async (data) =>{
        await client.send(
            JSON.stringify(data)
        )
    }

    const clearAccount = () => {
        sendData(["clear account"])
    }

    const clearFrames = () => {
        sendData(["clear"])
    }

    const hashPassword = async (password) => {
        const hash = await bcrypt.hash(password, saltRounds)
        return hash
    }

    const requireSignIn = async (me, password) => {
        sendData(['sign in', {name: me}])
        setPasswordCache(password)
    }

    const requireSignUp = async(me, password) => {
        const hash = await hashPassword(password)
        sendData(['sign up', {name: me, password: hash}])
    }

    const requestAddFrame = async(start, me) => {
        sendData(["add-request", {start, user: me}])
    }

    const requestEditFrame = async(start, me) => {
        sendData(["edit-request", {start, user: me}])
    }

    const doneEdit = (start, data) => {
        sendData(["done", {start, data}])
        setEditing(null)
    }

    return{
        editing,
        status,
        frames,
        clearFrames,
        requestAddFrame,
        requestEditFrame,
        requireSignIn,
        signedIn,
        requireSignUp,
        clearAccount,
        key,
        setKey,
        doneEdit
    }
}

export default useChat;