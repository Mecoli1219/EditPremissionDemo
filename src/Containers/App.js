import styled from 'styled-components'
import { useState, useEffect, useRef } from 'react'
import { message } from 'antd'
import Editor from "./Editor"
import SignIn from './SignIn'
import useChat from '../Hooks/useChat'

const LOCALSTORAGE_KEY = "save-me";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 500px;
  margin: auto;
`

function App() {
  const savedMe = localStorage.getItem(LOCALSTORAGE_KEY);

  const {
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
  } = useChat()

  const [me, setMe] = useState(savedMe || "");

  const displayStatus = (payload) => {
    if (payload.msg) {
      const {type, msg} = payload
      const content = {
        content: msg, duration: 0.5
      }
      switch (type){
        case "success":
          message.success(content)
          break
        case "error":
          message.error(content)
          break
        default: break
      }
    }
  }

  useEffect(() => {
    displayStatus(status)}, [status]
  )

  useEffect(()=> {
    if(signedIn){
      localStorage.setItem(LOCALSTORAGE_KEY, me)
    }
  }, [signedIn, me])

  return (
    <Wrapper>
      {signedIn ? 
        <Editor 
          clearFrames={clearFrames}
          requestAddFrame={requestAddFrame}
          requestEditFrame={requestEditFrame}
          frames={frames}
          me={me}
          displayStatus={displayStatus}
          nowEditing={editing}
          tabKey={key}
          setKey={setKey}
          doneEdit={doneEdit}
        /> :
        <SignIn
          me={me} 
          setMe={setMe}
          displayStatus={displayStatus}
          requireSignIn={requireSignIn}
          requireSignUp={requireSignUp}
          clearAccount={clearAccount}
        />
      }
    </Wrapper>
  )
}

export default App
