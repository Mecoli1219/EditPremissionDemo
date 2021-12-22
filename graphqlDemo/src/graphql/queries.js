import { gql } from "@apollo/client";

export const FRAME_QUERY = gql`
  query {
    getFrames {
      start
      data
      editing
    }
  }
`;
