import * as yup from "yup";

const schema = yup.object().shape({
    name: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().min(6),
    image: yup.mixed().test('required', 'avatar is a required field', file => {
        return file?.fileList;
    }).test("fileType", "Unsupported file format [jpg, png]", (file):any => {
        if(file?.fileList)
            return ["image/jpeg", "image/png", "image/jpg"].includes(file.fileList[0]?.type);
    })
});

export default schema;