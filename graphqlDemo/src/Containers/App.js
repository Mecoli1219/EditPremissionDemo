import styled from "styled-components";
import { useState, useEffect } from "react";
import { message } from "antd";
import Editor from "./Editor";
import SignIn from "./SignIn";

const LOCALSTORAGE_KEY = "save-me";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 500px;
  margin: auto;
`;

function App() {
  const savedMe = localStorage.getItem(LOCALSTORAGE_KEY);

  const [me, setMe] = useState(savedMe || "");
  const [status, setStatus] = useState({});
  const [signedIn, setSignedIn] = useState(false);
  // const [frames, setFrames] = useState([]);
  const [editing, setEditing] = useState(null);
  const [key, setKey] = useState(0);

  const displayStatus = (payload) => {
    if (payload.msg) {
      const { type, msg } = payload;
      const content = {
        content: msg,
        duration: 0.5,
      };
      switch (type) {
        case "success":
          message.success(content);
          break;
        case "error":
          message.error(content);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    displayStatus(status);
  }, [status]);

  useEffect(() => {
    if (signedIn) {
      localStorage.setItem(LOCALSTORAGE_KEY, me);
      console.log("me: ", me);
    }
  }, [signedIn, me]);

  useEffect(() => {
    console.log("me change", me);
  }, [me]);

  return (
    <Wrapper>
      {signedIn ? (
        <Editor
          me={me}
          displayStatus={displayStatus}
          nowEditing={editing}
          tabKey={key}
          setKey={setKey}
          setStatus={setStatus}
          setEditing={setEditing}
          editing={editing}
        />
      ) : (
        <SignIn
          me={me}
          setMe={setMe}
          setSignedIn={setSignedIn}
          setStatus={setStatus}
          displayStatus={displayStatus}
        />
      )}
    </Wrapper>
  );
}

export default App;
