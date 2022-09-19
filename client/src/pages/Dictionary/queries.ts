import {gql} from "@apollo/client";

export const DICTIONARIES_QUERIES = gql`
    query getDictionaries($filter: filterDictionaryGroupInput, $orderBy: orderDictionaryGroupInput, $skip: skip_Int_min_0, $take: take_Int_min_0){
        dictionaryGroups(filter: $filter, orderBy: $orderBy, skip: $skip, take: $take) {
            count
            data {
                id
                name
                _count
                createdAt
                updatedAt
            }
        }
    }
`

export const DICTIONARY_QUERIES = gql`
    query getDictionary($id: id_Int_NotNull_min_1!) {
        getDictionaryGroup(id: $id) {
            id
            name
            createdAt
            updatedAt
        }
    }
`

export const DICTIONARY_LIST_QUERIES = gql`
    query getDictionaryList($filter: filterDictionaryInput, $orderBy: orderDictionaryInput, $skip: skip_Int_min_0, $take: take_Int_min_0){
        dictionaries(filter: $filter, orderBy: $orderBy, skip: $skip, take: $take) {
            count
            data {
                id
                dictionaryGroupId
                wordId
                createdAt
                updatedAt
                dictionaryGroup {
                    id
                    name
                }
                word {
                    id
                    name
                    translation
                    transcription
                    rating
                }
            }
        }
    }
`