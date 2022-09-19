import * as yup from "yup";

export const schemaTest = yup.object().shape({
    typeTest: yup.number().required(),
});

const schema = yup.object().shape({
    name: yup.string().required(),
});

export default schema;