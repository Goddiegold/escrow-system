import { useUserContext } from "@/context/UserContext";
import { Button, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { At, Building } from "@phosphor-icons/react";
import { useFormik } from "formik";
import * as Yup from "yup"
import client from "@/shared/client";
import { toast } from "@/shared/helpers";
import { useState } from "react";
import { Action_Type, Company } from "@/shared/types";

const RegisterCompanyModal = () => {
    const [loading, setLoading] = useState(false)
    const { user, isLoggedIn } = useUserContext()
    const [opened, { open, close }] = useDisclosure(true);
    const { userDispatch } = useUserContext()

    const handleRegister = async (values) => {
        try {
            setLoading(true)
            const res = await client().post(`/companies/register`, { ...values})
            setLoading(false)
            const companyDetails = res.data?.result as Company
            userDispatch({
                type: Action_Type.USER_PROFILE,
                payload: {
                    companyId: companyDetails?.id,
                    company: companyDetails
                }
            })
            close()
            toast('Company info added successfully!').success()
        } catch (error) {
            setLoading(false)
            toast(error?.response?.data?.message).error()
        }
    }
    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required().label("company's name").min(3),
            email: Yup.string().email().required().max(50).label("company's email"),
        }),
        onSubmit: (values) => handleRegister(values)
    })

    const { values, touched, handleChange, handleSubmit, errors, handleBlur } = formik;
    return (
        <>
            <Modal
                closeOnClickOutside={false}
                closeOnEscape={false}
                withCloseButton={false}
                opened={opened} onClose={close} title="Add Company Info" centered>
                {/* Modal content */}
                <form onSubmit={handleSubmit}>
                    <TextInput
                        my={10}
                        required
                        label={"Name"}
                        description="Company's Name"
                        leftSection={<Building size={20} />}
                        onBlur={handleBlur("name")}
                        value={values.name}
                        onChange={handleChange("name")}
                        error={errors.name && touched.name ? errors.name : null}
                    />
                    <TextInput
                        my={10}
                        required
                        label={"Email"}
                        description="Company's Email"
                        leftSection={<At size={20} />}
                        onBlur={handleBlur("email")}
                        value={values.email}
                        onChange={handleChange("email")}
                        error={errors.email && touched.email ? errors.email : null}
                    />
                    <Button
                        type="submit"
                        my={10}
                        color="dark"
                        loading={loading}>Procced</Button>
                </form>
            </Modal>
        </>
    );
}

export default RegisterCompanyModal;