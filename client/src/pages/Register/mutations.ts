import {gql} from "@apollo/client";

export const REGISTER_MUTATION = gql`
    mutation signup($email: email_String_NotNull_format_email!, $password: password_String_NotNull_minLength_5!, $name: name_String_NotNull_minLength_3!, $image: Upload!){
        signup(email: $email, password: $password, name: $name, image: $image) {
            token
            user {
                id
                name
                email
                image
                createdAt
                updatedAt
            }
        }
    }
`