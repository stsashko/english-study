import * as yup from "yup";

export const schemaWords = yup.object().shape({
    words: yup.string().required()
});