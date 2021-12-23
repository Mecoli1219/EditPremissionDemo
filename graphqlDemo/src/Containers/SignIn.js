import { Input, Button, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Title from "../Components/Title";
import { useState, useRef } from "react";
import SignUpModal from "./SignUpModal";
import { useQuery, useMutation } from "@apollo/react-hooks";
import {
  REGISTER_MUTATION,
  SIGNIN_MUTATION,
  CLEARACCOUNT_MUTATION,
} from "../graphql";

const SignIn = (props) => {
  const { me, setMe, displayStatus, setStatus, setSignedIn } = props;

  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const nameRef = useRef();
  const passwordRef = useRef();
  const [register] = useMutation(REGISTER_MUTATION);
  const [signin] = useMutation(SIGNIN_MUTATION);
  const [clearAccount] = useMutation(CLEARACCOUNT_MUTATION);

  const handleOnClick = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSignUp = () => {
    setVisible(false);
    const name = nameRef.current.state.value;
    const password = passwordRef.current.state.value || "";
    nameRef.current.state.value = "";
    passwordRef.current.state.value = "";
    if (name.trim() === "" || !name) {
      displayStatus({
        type: "error",
        msg: "Please enter a valid username.",
      });
      return;
    }
    // requireSignUp(name, password)
    register({
      variables: {
        name: name,
        password: password,
      },
    }).then(({ data }) => {
      console.log(data);
      if (data.register.ok) {
        setStatus({ type: "success", msg: "account created" });
      } else {
        setStatus({ type: "error", msg: "create account fail" });
      }
    });
  };

  return (
    <>
      <Title>
        <h1>Editor Demo</h1>
        <Space>
          <Button type="secondary" onClick={handleOnClick}>
            Sign Up
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => {
              clearAccount().then(({ data }) => {
                if (data.clearAccount.ok) {
                  setStatus({ type: "success", msg: "account cleared" });
                } else {
                  setStatus({ type: "error", msg: "clear account fail" });
                }
              });
              displayStatus({
                type: "success",
                msg: "clear Account",
              });
            }}
          >
            Clear
          </Button>
        </Space>
      </Title>
      <Input.Search
        prefix={<UserOutlined />}
        value={me}
        onChange={(e) => setMe(e.target.value)}
        enterButton="Sign In"
        placeholder="Enter your name"
        onSearch={(name) => {
          if (!name)
            displayStatus({
              type: "error",
              msg: "Missing user name",
            });
          else {
            // requireSignIn(me, password);
            signin({
              variables: {
                name: me,
                password: password,
              },
            }).then(({ data }) => {
              console.log(data);
              if (data.login.ok) {
                setSignedIn(true);
                setStatus({ type: "success", msg: "login successful" });
              } else {
                setStatus({ type: "error", msg: "login fail" });
              }
            });
          }
        }}
      ></Input.Search>
      <Input.Password
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <SignUpModal
        visible={visible}
        onCancel={handleCancel}
        onSignUp={handleSignUp}
        nameRef={nameRef}
        passwordRef={passwordRef}
      />
    </>
  );
};

export default SignIn;
