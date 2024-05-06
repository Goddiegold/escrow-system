import BackgroundLayout from "@/components/layout/BackgroundLayout";
import {
    Button, PasswordInput,
    TextInput, Text
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup"
import { At, Lock } from "@phosphor-icons/react";
import { useState } from "react";
import client from "@/shared/client";
import { toast } from "@/shared/helpers";

const Login = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (user: { email: string, password: string }) => {
        try {
            setLoading(true)
            const res = await client().post(`/users/login`, { ...user })
            setLoading(false)
            const token = res.headers["authorization"];
            toast('Logged In Successfully!').success()
            // const userDetails = res.data?.data as User
            // if (userDispatch) {
            //     userDispatch({
            //         type: Action_Type.USER_PROFILE,
            //         payload: {
            //             ...userDetails,
            //             token
            //         }
            //     })
            // }
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
    return (
        <BackgroundLayout
            bottomContent={<>
                <Text style={{ textAlign: "center" }} size="sm">
                    Don't have an account yet?{" "}
                    <Link
                        to={"/register"}
                        className="font-bold text-blue-400 no-underline"
                    >
                        Sign Up
                    </Link>
                </Text>
            </>}
            title="Login to your account">
            <form method="POST"  onSubmit={handleSubmit}>
                <TextInput
                    onBlur={handleBlur("email")}
                    value={values.email}
                    onChange={handleChange("email")}
                    leftSection={<At size={20} />}
                    error={errors.email ? errors.email : null}
                    label="Email"
                    my={10} />
                <PasswordInput
                    onBlur={handleBlur("password")}
                    value={values.password}
                    onChange={handleChange("password")}
                    leftSection={<Lock size={20} />}
                    error={errors.password ? errors.password : null}
                    label="Password"
                    my={10} />
                <Button type="submit" my={10}>Login</Button>
            </form>
        </BackgroundLayout>
    );
}

export default Login;