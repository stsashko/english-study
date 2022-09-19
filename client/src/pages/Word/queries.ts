import {gql} from "@apollo/client";

export const WORDS_QUERIES = gql`
    query getWords($filter: filterWordInput, $orderBy: orderWordInput, $skip: skip_Int_min_0, $take: take_Int_min_0) {
        words(filter: $filter, orderBy: $orderBy, skip: $skip, take: $take) {
            count
            data {
                id
                name
                translation
                transcription
                rating
                createdAt
                updatedAt
            }
        }
    }
`

export const WORD_QUERIES = gql`
    query getWord($id: id_Int_NotNull_min_1!) {
        getWord(id: $id) {
            id
            name
            transcription
            translation,
            bySentence {
                id text translation
            }
        }
    }
`