import * as yup from "yup";

export const validationSchemaDictionary = yup.object().shape({
    nameDictionary: yup.string().required(),
});

const schema = yup.object().shape({
    name: yup.string().required(),
    transcription: yup.string().required(),
    translation: yup.string().required(),
    sentenceText: yup.string().required(),
    sentenceTranslation: yup.string().required(),
});

export default schema;