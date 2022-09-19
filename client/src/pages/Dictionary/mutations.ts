import {gql} from "@apollo/client";

export const ADD_DICTIONARY_MUTATION = gql`
    mutation Add($input: dictionaryGroupInput) {
        addDictionaryGroup(input: $input) {
            id
            name
            createdAt
            updatedAt
        }
    }
`;

export const UPD_DICTIONARY_MUTATION = gql`
    mutation Upd($id: id_Int_NotNull_min_1!, $input: dictionaryGroupInput) {
        updDictionaryGroup(id: $id, input: $input) {
            id
            name
            createdAt
            updatedAt
        }
    }
`

export const DEL_DICTIONARY_MUTATION = gql`
    mutation Del($id: id_Int_NotNull_min_1!) {
        delDictionaryGroup(id: $id) {
            id
            name
            createdAt
            updatedAt
        }
    }
`

export const DEL_DICTIONARY_LIST_MUTATION = gql`
    mutation Del($dictionaryGroupId: dictionaryGroupId_Int_NotNull_min_1!, $ids: [Int]!) {
        delDictionary(dictionaryGroupId: $dictionaryGroupId, ids: $ids) {
            count
        }
    }
`

export const CREATE_TEST_MUTATION = gql`
    mutation CreateTest($dictionaryGroupIds: [Int!]!) {
        createTest(dictionaryGroupIds: $dictionaryGroupIds) {
            id
            createdAt
            updatedAt
            rating
            completed
        }
    }
`;