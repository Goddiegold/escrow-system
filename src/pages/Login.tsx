import BackgroundLayout from "@/components/layout/BackgroundLayout";
import {
    Button, PasswordInput,
    TextInput, Text,
    Flex
} from "@mantine/core";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup"
import { At, Lock } from "@phosphor-icons/react";
import { useState } from "react";
import client, { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { Action_Type, Company, User } from "@/shared/types";
import { useUserContext } from "@/context/UserContext";
import { useQuery } from "@tanstack/react-query";
import AppLoader from "@/components/shared/AppLoader";

const Login = () => {
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

    const handleLogin = async (user: { email: string, password: string }) => {
        try {
            setLoading(true)
            const res = await client().post(companySlug ?
                `/users/login?companyId=${data?.id}` :
                "/users/login", { ...user })
            setLoading(false)
            const token = res.headers["authorization"];
            toast('Logged In Successfully!').success()
            const userDetails = res.data?.result as User
            userDispatch({
                type: Action_Type.USER_PROFILE,
                payload: {
                    ...userDetails,
                    token
                }
            })
            // const { completedOnboarding, emailVerified } = userDetails;
            // if (!emailVerified) {
            //     navigateHelper("/verify-otp")
            // } else {
            //     if (!completedOnboarding) {
            //         navigateHelper("/onboarding")
            //     }
            //     // if (!redirectUrl) {
            //     //   navigate("/dashboard")
            //     // }else{
            //     //   navigate(redirectUrl)
            //     // }
            //     // |
            //     redirectAutomatically("/dashboard")
            // }
            navigate("/dashboard")
        } catch (error: any) {
            setLoading(false)
            toast(error?.response?.data?.message).error()
        }

    }
    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: Yup.object({
            email: Yup.string().email().required().max(50),
            password: Yup.string().required().min(8).max(50)
        }),
        onSubmit: (values) => handleLogin(values)
    })

    const { values, touched, handleChange, handleSubmit, errors, handleBlur } = formik;

    if (isLoading) {
        return <AppLoader />
    }
    return (
        <BackgroundLayout
            bottomContent={<>
                <Text style={{ textAlign: "center" }} size="sm">
                    Don't have an account yet?{" "}
                    <Link
                        to={!companySlug ? "/register" : `/${companySlug}/register`}
                        className="font-bold text-blue-400 no-underline"
                    >
                        Sign Up
                    </Link>
                </Text>
            </>}
            title={!companySlug ? "Login to your account" :
                `Login to your escrow account with ${data?.name ?? "company"}`}
        >
            <form method="POST" onSubmit={handleSubmit}>
                <TextInput
                    required
                    onBlur={handleBlur("email")}
                    value={values.email}
                    onChange={handleChange("email")}
                    leftSection={<At size={20} />}
                    error={errors.email && touched?.email ? errors.email : null}
                    label="Email"
                    my={10} />
                <PasswordInput
                    required
                    onBlur={handleBlur("password")}
                    value={values.password}
                    onChange={handleChange("password")}
                    leftSection={<Lock size={20} />}
                    error={errors.password && touched?.password ? errors.password : null}
                    label="Password"
                    my={10} />
                <Flex justify={"space-between"} align={"center"}>
                    <Button
                        loading={loading}
                        type="submit"
                        my={10}>Login</Button>

                    <Button
                        onClick={() => navigate(!companySlug ? "/reset-password" : `/${companySlug}/reset-password`)}
                        fw={300}
                        fz={"sm"}
                        px={0}
                        variant="transparent">
                        Forgot password?
                    </Button>
                </Flex>
            </form>
        </BackgroundLayout>
    );
}

export default Login;