import { useState } from "react";
import bcrypt from "bcryptjs"

const saltRounds = 10;

const client = new WebSocket('ws://localhost:4000')
const useChat = () => {
    const [editing, setEditing] = useState(null);
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
                setFrames(()=>[...frames, payload])
                setEditing(parseInt(payload.start, 10))
                break
            }
            case "editing": {
                if (payload.start){
                    setEditing(parseInt(payload.start, 10))
                }
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

    const requestAddFrame = async(start) => {
        sendData(["add-request", {start, editing}])
    }

    const requestEditFrame = async(start) => {
        sendData(["edit-request", {start, editing}])
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
        clearAccount
    }
}

export default useChat;