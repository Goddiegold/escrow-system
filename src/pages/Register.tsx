import BackgroundLayout from "@/components/layout/BackgroundLayout";
import { Button, LoadingOverlay, PasswordInput, TextInput, Text }
    from "@mantine/core";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup"
import client from "@/shared/client";
import { toast } from "@/shared/helpers";
import { At, User as UserIcon, Lock } from "@phosphor-icons/react"

const Register = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (user: { email: string, password: string }) => {
        try {
            setLoading(true)
            const res = await client().post(`/users/register`, { ...user })
            setLoading(false)
            const token = res.headers["authorization"];
            toast('Logged In Successfully!').success()
            // const userDetails = res.data?.result as User
            // if (userDispatch) {
            //     userDispatch({
            //         type: Action_Type.USER_PROFILE,
            //         payload: {
            //             ...userDetails,
            //             token
            //         }
            //     })
            // }
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
        onSubmit: (values) => handleLogin(values)
    })

    const { values, touched, handleChange, handleSubmit, errors, handleBlur } = formik;

    return (
        <BackgroundLayout
            bottomContent={<>
                <Text >Already have an account ?
                    {" "}
                    <Link to={'/login'} className="font-bold text-blue-400 no-underline">
                        Login
                    </Link>
                </Text>
            </>}
            title="Create an account">

            <LoadingOverlay
                visible={loading}
                zIndex={1000}
                loaderProps={{ type: "dots" }}
                overlayProps={{ radius: "sm", blur: 2 }} />
            <form onSubmit={handleSubmit}>
                <TextInput
                    label="Name"
                    my={10}
                    onBlur={handleBlur("name")}
                    value={values.name}
                    onChange={handleChange("name")}
                    leftSection={<UserIcon size={20} />}
                    error={errors.name ? errors.name : null}
                />
                <TextInput
                    onBlur={handleBlur("email")}
                    value={values.email}
                    onChange={handleChange("email")}
                    error={errors.email ? errors.email : null}
                    label="Email"
                    leftSection={<At size={20} />}
                    my={10} />

                <PasswordInput
                    onBlur={handleBlur("password")}
                    value={values.password}
                    onChange={handleChange("password")}
                    leftSection={<Lock size={20} />}
                    error={errors.password ? errors.password : null}
                    label="Password"
                    my={10} />
                <Button my={10} type="submit">Register</Button>
            </form>
        </BackgroundLayout>
    );
}

export default Register;