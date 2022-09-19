import {gql} from "@apollo/client";

export const UPLOAD_AVATAR_MUTATION = gql`
    mutation uploadAvatar($image: Upload!){
        uploadAvatar(image: $image) {
            image
        }
    }
`

export const PROFILE_MUTATION = gql`
    mutation profile($email: email_String_NotNull_format_email!, $password: String, $name: name_String_NotNull_minLength_3!){
        profile(email: $email, password: $password, name: $name,) {
            name email
        }
    }
`