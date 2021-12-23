import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation register($name: String!, $password: String!) {
    register(name: $name, password: $password) {
      ok
      errors {
        path
        message
      }
    }
  }
`;

export const SIGNIN_MUTATION = gql`
  mutation signin($name: String!, $password: String!) {
    login(name: $name, password: $password) {
      ok
      errors {
        path
        message
      }
    }
  }
`;

export const ADDFRAME_MUTATION = gql`
  mutation addFrame($start: Float!, $data: String!, $editing: String!) {
    addFrame(frame: { start: $start, data: $data, editing: $editing }) {
      ok
    }
  }
`;

export const EDITREQUEST_MUTATION = gql`
  mutation editRequest($start: Float!, $editing: String!) {
    editRequest(request: { start: $start, editing: $editing }) {
      ok
    }
  }
`;

export const EDITFRAME_MUTATION = gql`
  mutation editFrame($start: Float!, $data: String!) {
    editFrame(frame: { start: $start, data: $data }) {
      ok
    }
  }
`;

export const CLEARFRAME_MUTATION = gql`
  mutation clearFrame {
    clearFrame {
      ok
    }
  }
`;

export const CLEARACCOUNT_MUTATION = gql`
  mutation clearAccount {
    clearAccount {
      ok
    }
  }
`;
