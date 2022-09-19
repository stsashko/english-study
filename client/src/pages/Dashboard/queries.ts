import {gql} from "@apollo/client";

export const STATISTIC_WORD_QUERIES = gql`
    query statisticWord($date: date_String_minLength_1) {
        statisticWord(date: $date) {
            name
            fail
            success
        }
    }
`

export const STATISTIC_SENTENCE_QUERIES = gql`
    query statisticSentence($date: date_String_minLength_1) {
        statisticSentence(date: $date) {
            name
            fail
            success
        }
    }
`

export const STATISTIC_QUESTION_QUERIES = gql`
    query statisticQuestion($date: date_String_minLength_1) {
        statisticQuestion(date: $date) {
            name
            GB_word
            UA_word
            GB_sentence
            UA_sentence
        }
    }
`