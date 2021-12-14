import { Button, Typography, Tabs } from 'antd'
import ButtonMui from '@mui/material/Button';
import TextField from "@mui/material/TextField"
import Title from "../Components/Title"
import Message from "../Components/Message"
import {useState, useRef} from "react"
import AddModal from './AddModal'

const {Text} = Typography

const {TabPane} = Tabs

function useForceUpdate(){
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value + 1); // update the state to force render
}

const ChatRoom = (props) =>{
  // const [key, setKey] = useState(0)
  const [visible, setVisible] = useState(false)
  const addRef = useRef()
  const dataRef = useRef()
  const [inChatBox, setInChatBox] = useState(false)
  const forceUpdate = useForceUpdate();

  const {
    frames, 
    clearFrames,
    requestAddFrame,
    requestEditFrame,
    me,
    displayStatus,
    nowEditing,
    tabKey, setKey,
    doneEdit
  } = props
// console.log(key)
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
    if ((start < 0 || !start) && start !== 0){
      displayStatus({
        type: "error",
        msg: "Please enter a positive number."
      })
      return
    }
    requestAddFrame(start, me);
    setInChatBox(false)
  }

  const handleDoneEditing = (start) => {
    const data = dataRef.current.children[1].children[0].value
    doneEdit(start, data)
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
          activeKey={tabKey}
          onEdit={handleTabsEdit}
        >{frames.map(({start, data, editing}, i) => (
          <TabPane tab={i+""} key={i} closable={false} style={{ height: "200px", overflow: "auto" }}>
            <Text >Editing: {editing==="" ? "None": editing}</Text><br/>
            <Text >Start: {start}</Text><br/>
            <TextField 
              id="data" 
              label="Data" 
              variant="outlined"
              ref={i === nowEditing ? dataRef : undefined}
              disabled={i === nowEditing ? undefined : true}
              value={i === nowEditing ? undefined : data} 
            />
            <br/><br/>
            <ButtonMui 
              variant="contained" 
              onClick={() => requestEditFrame(start, me)} 
              disabled={editing === "" ? undefined: true}
            >Edit</ButtonMui>
            <ButtonMui 
              variant="contained" 
              onClick={() => handleDoneEditing(start)} 
              disabled={i === nowEditing ? undefined : true}
            >Done</ButtonMui>
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
