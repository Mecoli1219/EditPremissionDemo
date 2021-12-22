import { gql } from "@apollo/client";

export const FRAME_SUBSCRIPTION = gql`
  subscription {
    frame {
      mutation
      addFrame {
        ok
        frame {
          start
          data
          editing
        }
        index
        cancelIndex
        deleteIndex
        errors {
          path
          message
        }
      }
      editFrame {
        ok
        frame {
          start
          data
          editing
        }
        index
        cancelIndex
        deleteIndex
        errors {
          path
          message
        }
      }
      editRequest {
        ok
        index
        cancelIndex
        editing
        errors {
          path
          message
        }
      }
    }
  }
`;
