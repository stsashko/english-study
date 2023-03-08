import {gql} from "@apollo/client";

export const GET_USER_QUERY = gql`
    query get {
        getUser {
            id name email image createdAt updatedAt rapidApiKey
        }
    }
`