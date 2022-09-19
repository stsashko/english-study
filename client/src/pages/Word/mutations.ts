import {gql} from "@apollo/client";

export const ADD_WORD_MUTATION = gql`
    mutation Add($input: wordInput){
        addWord(input: $input) {
            id
            name
            translation
            transcription
            rating
            createdAt
            updatedAt
        }
    }
`;

export const UPD_WORD_MUTATION = gql`
    mutation Upd($id: id_Int_NotNull_min_1!, $input: wordInput){
        updWord(id: $id, input: $input) {
            id
            name
            translation
            transcription
            rating
            createdAt
            updatedAt
        }
    }
`

export const DEL_WORD_MUTATION = gql`
    mutation Del($id: id_Int_NotNull_min_1!) {
        delWord(id: $id) {
            id
            name
            translation
            transcription
            createdAt
            updatedAt
        }
    }
`

export const CREATE_DICTIONARY_MUTATION = gql`
    mutation CreateDictionary($nameDictionary: nameDictionary_String_NotNull_min_1!, $wordsId: [Int]!) {
        createDictionary(nameDictionary: $nameDictionary, wordsId: $wordsId) {
            count
        }
    }
`