import BackgroundLayout from "@/components/layout/BackgroundLayout";
import { Button, LoadingOverlay, PasswordInput, TextInput, Text, Flex }
    from "@mantine/core";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup"
import client, { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { At, User as UserIcon, Lock } from "@phosphor-icons/react"
import { useUserContext } from "@/context/UserContext";
import { Action_Type, Company, User } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";
import AppLoader from "@/components/shared/AppLoader";

const Register = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { userDispatch } = useUserContext()
    const clientInstance = useClient()
    const { companySlug } = useParams()

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

    const handleRegister = async (user: { email: string, password: string }) => {
        try {
            setLoading(true)
            const res = await client().post(!companySlug ? `/users/register` :
                `/users/register?companySlug=${companySlug}`, { ...user })
            setLoading(false)
            const token = res.headers["authorization"];
            toast('Logged In Successfully!').success()
            const userDetails = res.data?.result as User
            if (userDispatch) {
                userDispatch({
                    type: Action_Type.USER_PROFILE,
                    payload: {
                        ...userDetails,
                        token
                    }
                })
            }
            navigate("/dashboard")
        } catch (error: any) {
            setLoading(false)
            toast(error?.response?.data?.message).error()
        }

    }

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: ""
        },
        validationSchema: Yup.object({
            name: Yup.string().required().label("Name").min(3),
            email: Yup.string().email().required().max(50).label("Email"),
            password: Yup.string().required().min(8).max(50).label("Password")
        }),
        onSubmit: (values) => handleRegister(values)
    })

    const { values, touched, handleChange, handleSubmit, errors, handleBlur } = formik;


    if (isLoading) {
        return <AppLoader />
    }
    return (
        <BackgroundLayout
            bottomContent={<>
                <Text style={{ textAlign: "center" }} size="sm">Already have an account ?
                    {" "}
                    <Link to={!companySlug ? '/login' : `/${companySlug}/login`}
                        className="font-bold text-blue-400 no-underline">
                        Login
                    </Link>
                </Text>
            </>}
            title={!companySlug ? "Create a business account" : `Create an escrow account under ${data?.name ?? "company"}`}>

            {/* <LoadingOverlay
                visible={loading || isLoading}
                zIndex={1000}
                loaderProps={{ type: "dots" }}
                overlayProps={{ radius: "sm", blur: 2 }} /> */}
            <form onSubmit={handleSubmit}>
                <TextInput
                    label="Name"
                    my={10}
                    onBlur={handleBlur("name")}
                    value={values.name}
                    onChange={handleChange("name")}
                    leftSection={<UserIcon size={20} />}
                    error={errors.name && touched.name ? errors.name : null}
                />
                <TextInput
                    onBlur={handleBlur("email")}
                    value={values.email}
                    onChange={handleChange("email")}
                    error={errors.email && touched.email ? errors.email : null}
                    label="Email"
                    leftSection={<At size={20} />}
                    my={10} />

                <PasswordInput
                    onBlur={handleBlur("password")}
                    value={values.password}
                    onChange={handleChange("password")}
                    leftSection={<Lock size={20} />}
                    error={errors.password && touched.password ? errors.password : null}
                    label="Password"
                    my={10} />
                <Button
                    loading={loading}
                    my={10}
                    type="submit">Register</Button>
            </form>
        </BackgroundLayout>
    );
}

export default Register;