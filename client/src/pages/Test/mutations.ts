import {gql} from "@apollo/client";

export const SEND_ANSWER_WITH_QUESTION_WORD_MUTATION = gql`
    mutation sendAnswerWithQuestionWord($input: AnswerInputWord) {
        sendAnswerWithQuestionWord(input: $input) {
            questionId
            rating
            totalFailures
            totalQuestions
            totalResponses
            totalSuccesses
            success
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
            },
        }
    }
`;

export const SEND_ANSWER_WITH_QUESTION_SENTENCE_MUTATION = gql`
    mutation sendAnswerWithQuestionSentence($input: AnswerInputSentence) {
        sendAnswerWithQuestionSentence(input: $input) {
            questionId
            rating
            pagination {
                completed
                current
                number
                success
            }
            success
            totalFailures
            totalQuestions
            totalResponses
            totalSuccesses
        }
    }
`;

export const DELETE_FULL_TEST_MUTATION = gql`
    mutation DeleteFullTest($testId: id_Int_NotNull_min_1!) {
        deleteFullTest(id: $testId) {
            id
            rating
            completed
            createdAt
            updatedAt
        }
    }
`;

export const RESET_FULL_TEST_MUTATION = gql`
    mutation ResetFullTest($testId: id_Int_NotNull_min_1!) {
        resetFullTest(id: $testId) {
            id
            completed
            rating
            createdAt
            updatedAt
        }
    }
`;