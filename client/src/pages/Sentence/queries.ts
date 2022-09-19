import {gql} from "@apollo/client";

export const SENTENCES_QUERIES = gql`
    query getSentences($filter: filterSentenceInput, $orderBy: orderSentenceInput, $skip: skip_Int_min_0, $take: take_Int_min_0) {
        sentences(filter: $filter, orderBy: $orderBy, skip: $skip, take: $take) {
            count
            data {
                id
                text
                translation
                rating
                createdAt
                updatedAt
                word {
                    id
                    name
                }
            }
        }
    }
`

export const SENTENCE_QUERIES = gql`
    query getSentence($id: id_Int_NotNull_min_1!) {
        getSentence(id: $id) {
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
`