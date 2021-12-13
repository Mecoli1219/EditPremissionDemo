import { Button, Typography, Tabs } from 'antd'
import ButtonMui from '@mui/material/Button';
import TextField from "@mui/material/TextField"
import Title from "../Components/Title"
import Message from "../Components/Message"
import {useState, useRef} from "react"
import AddModal from './AddModal'

const {Paragraph} = Typography

const {TabPane} = Tabs

function useForceUpdate(){
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value + 1); // update the state to force render
}

const ChatRoom = (props) =>{
  const [key, setKey] = useState(0)
  const [visible, setVisible] = useState(false)
  const addRef = useRef()
  const [inChatBox, setInChatBox] = useState(false)
  const forceUpdate = useForceUpdate();

  const {
    frames, 
    clearFrames,
    requestAddFrame,
    requestEditFrame,
    me,
    displayStatus,
    nowEditing
  } = props

  const handleTabsOnChange = (key) => {
    setKey(key)
    setInChatBox(true)
  }

  const handleTabsEdit = (targetKey, action)=> {
    if (action === "add") {
      add();
    }
  }

  const add = ()=> {
    setVisible(true)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const handleCreate = () => {
    setVisible(false)
    const start = parseInt(addRef.current.state.value, 10)
    addRef.current.state.value = ""
    if (start < 0 || !start){
      displayStatus({
        type: "error",
        msg: "Please enter a positive number."
      })
      return
    }
    requestAddFrame(start);
    setInChatBox(false)
  }

  return (
    <>
      <Title>
        <h1>Editor: {me}</h1>
        <Button type="primary" danger onClick={()=>{
          clearFrames()
          displayStatus({
            type: "success",
            msg: "clear DB"
          })
        }}>
          Clear frames
        </Button>
      </Title>
      <Message>
        <Tabs
          type="editable-card"
          onChange={handleTabsOnChange}
          activeKey={key}
          onEdit={handleTabsEdit}
        >{frames.map(({start, data, editing}, i) => (
          <TabPane tab={start+""} key={i} closable={false} style={{ height: "200px", overflow: "auto" }}>
            <br/>
            <TextField 
              id="data" 
              label="Data" 
              variant="outlined"
              disabled={start === nowEditing ? undefined : true}
              defaultValue={data} 
            />
            <br/><br/>
            <ButtonMui variant="contained" onClick={() => requestEditFrame(start)} disable={editing}>Edit</ButtonMui>
          </TabPane>
        ))}
        </Tabs>
      </Message>
      
      <AddModal
        visible={visible}
        onCancel={handleCancel}
        onCreate={handleCreate}
        inputRef={addRef}
      />

    </>
  )
}

export default ChatRoom
