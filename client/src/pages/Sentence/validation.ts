import * as yup from "yup";

const schema = yup.object().shape({
    text: yup.string().required(),
    translation: yup.string().required(),
});

export default schema;