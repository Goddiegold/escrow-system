import { useUserContext } from "@/context/UserContext";
import client from "@/shared/client";
import { toast } from "@/shared/helpers";
import { Action_Type } from "@/shared/types";
import { Button, Flex, TextInput, Textarea } from "@mantine/core";
import { At, User as UserIcon, MapPinSimpleArea } from "@phosphor-icons/react"
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";

const ProfileSettings = () => {
    const { user, userDispatch } = useUserContext()
    const [loading, setLoading] = useState(false)

    const handleUpdate = (values: Record<string, string>) => {
        setLoading(true)
        client().put("/users/update-profile", {
            ...values
        })
            .then(res => {
                setLoading(false)
                toast("Successfully Updated Profile!").success()
                userDispatch({
                    type: Action_Type.USER_PROFILE,
                    payload: { ...res?.data?.result }
                })
            }).catch(err => {
                setLoading(false)
                toast(err?.response?.data?.message).error()
            })
    }

    const formik = useFormik({
        initialValues: {
            name: user?.name || "",
            email: user?.email || "",
            address: user?.address || "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email().required().max(50),
            name: Yup.string().required().min(3).max(50),
            address: Yup.string().optional(),
        }),
        onSubmit: handleUpdate
    })

    const { values, touched, handleChange, handleSubmit, errors, handleBlur, setFieldValue } = formik;

    return (
        <Flex direction={"column"} maw={500}>
            <form onSubmit={handleSubmit}>
                <TextInput
                    onBlur={handleBlur}
                    value={values.name}
                    onChange={handleChange("name")}
                    leftSection={<UserIcon size={20} />}
                    label="Name" my={10}
                    error={touched.name && errors.name ? errors.name : null}
                />
                <TextInput
                    onBlur={handleBlur}
                    value={values.email}
                    onChange={handleChange("email")}
                    leftSection={<At size={20} />}
                    error={touched.email && errors.email ? errors.email : null}
                    label="Email" my={10} />
                <Textarea
                    leftSection={<MapPinSimpleArea size={20} />}
                    my={10}
                    label="Address"
                    onBlur={handleBlur}
                    value={values.address}
                    onChange={handleChange("address")}
                    error={touched.address && errors.address ? errors.address : null}
                // placeholder="Input placeholder"
                />
                <Button my={10} loading={loading} type="submit">Update</Button>
            </form>
        </Flex>
    );
}

export default ProfileSettings;