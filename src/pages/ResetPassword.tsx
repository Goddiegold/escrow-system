import BackgroundLayout from "@/components/layout/BackgroundLayout";
import { Button, TextInput, Flex, PasswordInput } from "@mantine/core";
import { ArrowLeft, At, Lock } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup"
import { useState } from "react";
import client, { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { useQuery } from "@tanstack/react-query";
import { Company } from "@/shared/types";
import AppLoader from "@/components/shared/AppLoader";

const ResetPassword = () => {
    const [loading, setLoading] = useState(false)
    const { otl } = useParams()
    const navigate = useNavigate()
    const clientInstance = useClient()
    const { companySlug } = useParams()
    const loginPath = !companySlug ? "/login" : `/${companySlug}/login`

    const { data, isLoading } = useQuery({
        queryKey: ["company-info", companySlug],
        queryFn: () => clientInstance().get(`/companies/company-info/${companySlug}`)
            .then(res => res.data?.result as Company)
            .catch(err => {
                toast(err?.response?.data?.message).error()
                navigate("*")
            })
        ,
        enabled: !!companySlug
    })

    const handleResetPassword = async (values: Record<string, string>) => {
        try {
            const requestPath = (!otl ? "/users/reset-password" : `/users/reset-password/${otl}`)
            setLoading(true)
            const res = await client().post(requestPath + (companySlug ? `?companyId=${data?.id}` : ""),
                !otl ? { ...values } : { password: values.newPassword })
            setLoading(false)
            formik.resetForm()
            toast(res?.data?.message).success()
            if (otl) {
                navigate(loginPath)
            }
        } catch (error) {
            setLoading(false)
            toast(error?.response?.data?.message).error()
        }
    }

    const formik = useFormik({
        initialValues: !otl ? {
            email: "",
        } : {
            newPassword: "",
            confirmPassword: ""
        },
        validationSchema: Yup.object(!otl ? {
            email: Yup.string().email().required().max(50),
        } : {
            newPassword: Yup.string().required().min(8).max(50).label("Password")
                .min(8, 'Password must be at least 8 characters long'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword')], 'Passwords must match')
                .label('Confirm Password'),
        }),
        onSubmit: (values) => handleResetPassword(values)
    })

    const { values, touched, handleChange, handleSubmit, errors, handleBlur } = formik;

    if (isLoading) {
        return <AppLoader />
    }
    return (
        <BackgroundLayout title={!companySlug ? "Reset Password" : `Reset your password with ${data?.name} on Escrow`}>
            <form onSubmit={handleSubmit}>
                {!otl ?
                    <TextInput
                        onBlur={handleBlur("email")}
                        value={values.email}
                        onChange={handleChange("email")}
                        error={errors.email && touched?.email ? errors.email : null}
                        required
                        leftSection={<At size={20} />}
                        label="Your email" my={10} /> :
                    <>
                        <PasswordInput
                            onBlur={handleBlur("newPassword")}
                            value={values.newPassword}
                            onChange={handleChange("newPassword")}
                            leftSection={<Lock size={20} />}
                            error={errors.newPassword && touched?.newPassword ? errors.newPassword : null}
                            label="New Password"
                            my={10} />
                        <PasswordInput
                            onBlur={handleBlur("confirmPassword")}
                            value={values.confirmPassword}
                            onChange={handleChange("confirmPassword")}
                            leftSection={<Lock size={20} />}
                            error={errors.confirmPassword && touched?.confirmPassword ? errors.confirmPassword : null}
                            label="Confirm Password"
                            my={10} />
                    </>
                }
                <Flex justify={"space-between"} align={"center"}>
                    <Button
                        onClick={() => navigate(loginPath)}
                        fw={400}
                        c={"gray"}
                        px={0}
                        variant="transparent"
                        leftSection={<ArrowLeft size={15} />}>
                        Back to the login page
                    </Button>
                    <Button
                        loading={loading}
                        type="submit"
                        my={10}>Proceed</Button>
                </Flex>

            </form>
        </BackgroundLayout>
    );
}

export default ResetPassword;