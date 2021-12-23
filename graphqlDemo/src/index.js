import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./Containers/App";
import reportWebVitals from "./reportWebVitals";
import "antd/dist/antd.css";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import { split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";

// Create an http link:
const httpLink = new HttpLink({
  uri: "http://localhost:5000",
});

// Create a WebSocket link:
// const wsLink = new WebSocketLink({
//   uri: `ws://localhost:5000`,
//   options: { reconnect: true },
// });

const wsClient = new SubscriptionClient(`ws://localhost:5000`, {
  reconnect: true,
});
const wsLink = new WebSocketLink(wsClient);
// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

wsClient.onConnected(() => console.log("websocket connected!!"));
wsClient.onDisconnected(() => console.log("websocket disconnected!!"));
wsClient.onReconnected(() => console.log("websocket reconnected!!"));

const client = new ApolloClient({
  link,
  cache: new InMemoryCache().restore({}),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
