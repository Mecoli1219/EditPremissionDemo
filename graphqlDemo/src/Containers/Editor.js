import { Button, Typography, Tabs } from "antd";
import ButtonMui from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Title from "../Components/Title";
import Message from "../Components/Message";
import { useState, useRef, useEffect } from "react";
import AddModal from "./AddModal";
import { useQuery, useMutation } from "@apollo/react-hooks";
import {
  ADDFRAME_MUTATION,
  EDITREQUEST_MUTATION,
  EDITFRAME_MUTATION,
  CLEARFRAME_MUTATION,
} from "../graphql";
import { FRAME_QUERY, FRAME_SUBSCRIPTION } from "../graphql";

const { Text } = Typography;

const { TabPane } = Tabs;

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value + 1); // update the state to force render
}

const ChatRoom = (props) => {
  // const [key, setKey] = useState(0)
  const [visible, setVisible] = useState(false);
  const addRef = useRef();
  const dataRef = useRef();
  const [inChatBox, setInChatBox] = useState(false);
  const forceUpdate = useForceUpdate();
  const [addFrame] = useMutation(ADDFRAME_MUTATION);
  const [editRequest] = useMutation(EDITREQUEST_MUTATION);
  const [editFrame] = useMutation(EDITFRAME_MUTATION);
  const [clearFrame] = useMutation(CLEARFRAME_MUTATION);
  const { loading, error, data, subscribeToMore } = useQuery(FRAME_QUERY);

  const {
    me,
    displayStatus,
    nowEditing,
    tabKey,
    setKey,
    setEditing,
    editing,
    setStatus,
  } = props;
  // console.log(key)
  useEffect(() => {
    try {
      subscribeToMore({
        document: FRAME_SUBSCRIPTION,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          const newUpdate = subscriptionData.data.frame;
          switch (newUpdate.mutation) {
            case "ADDED": {
              const { ok, frame, index, cancelIndex, deleteIndex, errors } =
                newUpdate.addFrame;
              const frames = prev.getFrames;
              let newFrame = [];
              if (ok) {
                newFrame = [
                  ...frames.slice(0, cancelIndex),
                  { ...frames[cancelIndex], editing: "" },
                  ...frames.slice(cancelIndex + 1),
                ];
                console.log("current user: ", me);
                console.log("incoming change: " + frame.editing);
                if (frame.editing === me) {
                  newFrame = [
                    ...newFrame.slice(0, index),
                    frame,
                    ...newFrame.slice(index),
                  ];
                  setEditing(index);
                  setKey(index * 1 + "");
                } else {
                  newFrame = [
                    ...newFrame.slice(0, index),
                    frame,
                    ...newFrame.slice(index),
                  ];
                  console.log("change from other: ", index);
                  if (editing >= index && editing !== null) {
                    console.log("here", editing, index);
                    setEditing(editing + 1);
                    setKey(tabKey * 1 + 1 + "");
                  }
                }
              }
              console.log({ getFrames: newFrame });
              return { getFrames: newFrame };
            }
            case "EDIT_REQUEST": {
              const { ok, index, cancelIndex, editing } = newUpdate.editRequest;
              let newFrame = [];
              const frames = prev.getFrames;

              if (ok) {
                console.log(me);
                if (editing === me) {
                  setEditing(index);
                }
                newFrame = [
                  ...frames.slice(0, cancelIndex),
                  { ...frames[cancelIndex], editing: "" },
                  ...frames.slice(cancelIndex + 1),
                ];
                newFrame = [
                  ...newFrame.slice(0, index),
                  { ...newFrame[index], editing },
                  ...newFrame.slice(index + 1),
                ];
                return { getFrames: newFrame };
              }
              break;
            }

            case "EDITED_WITHOUT_SEQUENCE_CHANGE": {
              const { ok, index, frame } = newUpdate.editFrame;
              const frames = prev.getFrames;
              if (ok) {
                let newFrame = [
                  ...frames.slice(0, index),
                  { ...frames[index], editing: "", data: frame.data },
                  ...frames.slice(index + 1),
                ];
                return { getFrames: newFrame };
              }
              break;
            }
            case "CLEARED": {
              setEditing(null);
              return { getFrames: [] };
            }
            default: {
              console.log("default");
            }
          }
        },
      });
    } catch (e) {
      console.log(e);
    }
  }, [subscribeToMore]);

  const handleTabsOnChange = (key) => {
    setKey(key);
    setInChatBox(true);
  };

  const handleTabsEdit = (targetKey, action) => {
    if (action === "add") {
      add();
    }
  };

  const add = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleCreate = () => {
    setVisible(false);
    const start = parseInt(addRef.current.state.value, 10);
    addRef.current.state.value = "";
    if ((start < 0 || !start) && start !== 0) {
      displayStatus({
        type: "error",
        msg: "Please enter a positive number.",
      });
      return;
    }
    // requestAddFrame(start, me);
    addFrame({
      variables: {
        start,
        data: "",
        editing: me,
      },
    }).then(({ data }) => {
      if (data.addFrame.ok) {
        setStatus({ type: "success", msg: "add frame success" });
      } else {
        setStatus({ type: "error", msg: "add frame fail" });
      }
    });
    setInChatBox(false);
  };

  const handleDoneEditing = (start) => {
    const data = dataRef.current.children[1].children[0].value;
    // doneEdit(start, data);
    editFrame({
      variables: {
        start,
        data,
      },
    }).then(({ data }) => {
      if (data.editFrame.ok) {
        setStatus({ type: "success", msg: "edit success" });
        setEditing(null);
      } else {
        setStatus({ type: "error", msg: "edit fail" });
      }
    });
  };

  return (
    <>
      <Title>
        <h1>Editor: {me}</h1>
        <Button
          type="primary"
          danger
          onClick={() => {
            // clearFrames();
            // displayStatus({
            //   type: "success",
            //   msg: "clear DB",
            // });
            clearFrame({}).then(({ data }) => {
              if (data.clearFrame.ok) {
                setStatus({ type: "success", msg: "request success" });
              } else {
                setStatus({ type: "error", msg: "request fail" });
              }
            });
          }}
        >
          Clear frames
        </Button>
      </Title>
      <Message>
        <Tabs
          type="editable-card"
          onChange={handleTabsOnChange}
          activeKey={tabKey}
          onEdit={handleTabsEdit}
        >
          {!loading &&
            data.getFrames.map(({ start, data, editing }, i) => (
              <TabPane
                tab={i + ""}
                key={i}
                closable={false}
                style={{ height: "200px", overflow: "auto" }}
              >
                <Text>Editing: {editing === "" ? "None" : editing}</Text>
                <br />
                <Text>Start: {start}</Text>
                <br />
                <TextField
                  id="data"
                  label="Data"
                  variant="outlined"
                  ref={i === nowEditing ? dataRef : undefined}
                  disabled={i === nowEditing ? undefined : true}
                  value={i === nowEditing ? undefined : data}
                />
                <br />
                <br />
                <ButtonMui
                  variant="contained"
                  onClick={() => {
                    // requestEditFrame(start, me)
                    editRequest({
                      variables: {
                        start,
                        editing: me,
                      },
                    }).then(({ data }) => {
                      if (data.editRequest.ok) {
                        setStatus({ type: "success", msg: "request success" });
                      } else {
                        setStatus({ type: "error", msg: "request fail" });
                      }
                    });
                  }}
                  disabled={editing === "" ? undefined : true}
                >
                  Edit
                </ButtonMui>
                <ButtonMui
                  variant="contained"
                  onClick={() => handleDoneEditing(start)}
                  disabled={i === nowEditing ? undefined : true}
                >
                  Done
                </ButtonMui>
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
  );
};

export default ChatRoom;
