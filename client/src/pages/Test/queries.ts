import {gql} from "@apollo/client";

export const TEST_QUERIES = gql`
    query GetTests($filter: filterTestInput, $orderBy: orderTestInput, $skip: skip_Int_min_0, $take: take_Int_min_0) {
        tests(filter: $filter, orderBy: $orderBy, skip: $skip, take: $take) {
            count
            data {
                id
                completed
                rating
                createdAt
                updatedAt
                testDictionary {
                    id
                    dictionaryGroupId
                    dictionaryGroup {
                        name
                    }
                }
                TestType {
                    type
                    completed
                }
                _count
            }
        }
    }
`

export const RANDOM_QUESTION_WORD_QUERIES = gql`
    query getRandomQuestionWord($testId: testId_Int_min_1, $lang: Lang) {
        getRandomQuestionWord(testId: $testId, lang: $lang) {
            questionId
            totalFailures
            totalQuestions
            totalResponses
            totalSuccesses
            word
            transcription
            testIsOver
            pagination {
                number
                current
                completed
                success
            }
            currentQuestions {
                wordId
                wordName
                wordTranscription
                completed
                answer
                customerAnswer
            }
        }
    }
`

export const RANDOM_QUESTION_SENTENCE_QUERIES = gql`
    query getRandomQuestionSentence($testId: testId_Int_min_1, $lang: Lang) {
        getRandomQuestionSentence(testId: $testId, lang: $lang) {
            questionId
            sentence
            answer
            totalQuestions
            totalSuccesses
            totalFailures
            totalResponses
            testIsOver
            pagination {
                number
                current
                completed
                success
            }
        }
    }
`