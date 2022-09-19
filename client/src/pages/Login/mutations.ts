import {gql} from "@apollo/client";

export const LOGIN_MUTATION = gql`
    mutation Login($email: email_String_NotNull_format_email!, $password: password_String_NotNull_minLength_5!){
        login(email: $email, password: $password) {
            token
            user {
                id
                name
                email
                createdAt
                updatedAt
            }
        }
    }
`