import * as yup from "yup";

const schema = yup.object().shape({
    name: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().test(
        'empty-or-6',
        'Password must be at least 6 characters',
        password => !password || password.length >= 6,
    ),
});

export default schema;