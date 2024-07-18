import client from "@/shared/client";
import { toast } from "@/shared/helpers";
import { Button, Flex, PasswordInput } from "@mantine/core";
import { LockSimple } from "@phosphor-icons/react";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup"

const SecuritySettings = () => {
    const [loading, setLoading] = useState(false)

    const handleUpdatePassword =
        (values: {
            currentPassword: string,
            newPassword: string, confirmNewPassword: string
        }) => {
            setLoading(true)
            client()
                .put("/users/update-password",
                    {
                        oldPassword: values.currentPassword,
                        newPassword: values.newPassword
                    })
                .then(res => {
                    console.log(res.data)
                    setLoading(false)
                    formik.resetForm()
                    toast(res.data?.message).success()
                }).catch(err => {
                    console.log(err)
                    setLoading(false)
                    toast(err?.response?.data?.message).error()
                })
        }

    const formik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },
        validationSchema: Yup.object().shape({
            currentPassword: Yup.string().required('Current Password is required'),
            newPassword: Yup.string()
                .min(8, 'Password must be at least 8 characters long')
                .required('New Password is required'),
            confirmNewPassword: Yup.string()
                .oneOf([Yup.ref('newPassword')], 'Passwords must match')
                .required('Confirm Password is required'),
        }),
        onSubmit: (values) => handleUpdatePassword(values)
    })

    const { values, touched, handleChange, handleSubmit, errors, handleBlur } = formik;


    return (
        <Flex direction={"column"} maw={500}>
            <form onSubmit={handleSubmit}>
                <PasswordInput
                    onBlur={handleBlur("currentPassword")}
                    value={values.currentPassword}
                    onChange={handleChange("currentPassword")}
                    error={touched.currentPassword && errors.currentPassword ? errors.currentPassword : null}
                    leftSection={<LockSimple size={20} />}
                    my={10}
                    label="Current Password"
                />
                <PasswordInput
                    onBlur={handleBlur("newPassword")}
                    value={values.newPassword}
                    onChange={handleChange("newPassword")}
                    error={touched.newPassword && errors.newPassword ? errors.newPassword : null}
                    leftSection={<LockSimple size={20} />}
                    my={10}
                    label="New Password"
                />
                <PasswordInput
                    onBlur={handleBlur("confirmNewPassword")}
                    value={values.confirmNewPassword}
                    onChange={handleChange("confirmNewPassword")}
                    error={touched.confirmNewPassword && errors.confirmNewPassword ? errors.confirmNewPassword : null}
                    leftSection={<LockSimple size={20} />}
                    my={10}
                    label="Confirm Password"
                />
                <Button my={10} type="submit" loading={loading}>Update</Button>
            </form>
        </Flex>
    );
}

export default SecuritySettings;