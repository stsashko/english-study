import {gql} from "@apollo/client";

export const UPD_SENTENCE_MUTATION = gql`
    mutation Upd($id: id_Int_NotNull_min_1!, $input: sentenceInput) {
        updSentence(id: $id, input: $input) {
            id
            text
            translation
            createdAt
            updatedAt
            word {
                name
            }
        }
    }
`;