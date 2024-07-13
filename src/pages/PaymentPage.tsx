import Logo from "@/components/shared/Logo";
import client, { useClient } from "@/shared/client";
import { calculateServiceFee, toast } from "@/shared/helpers";
import { Button, Divider, Flex, LoadingOverlay, NumberFormatter, Text } from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from "react-router-dom";
import { PaystackConsumer } from "react-paystack";
import { Order } from "@/shared/types";
import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";

const PaymentPage = () => {
    const { orderRef } = useParams()
    const clientInstance = useClient()
    const navigate = useNavigate()
    const paymentRef = `orderPayment_${uuidv4()}`;
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState(false)

    const { data,
        isLoading } = useQuery({
            queryKey: ["orderRef", orderRef],
            queryFn: async () => {
                try {
                    const res = await clientInstance().get(`/orders/order-ref/${orderRef}`)
                    return res?.data?.result as Order[];
                } catch (error) {
                    toast(error?.response?.data?.message).error()
                    navigate("/not-found")
                }
            },
            refetchOnMount: "always",
            enabled: !!orderRef
        })

    const orderPrice = data ? data.reduce((acc: number, item) => {
        return acc + item!.totalAmount;
    }, 0) : 0;

    const serviceCharge = calculateServiceFee(orderPrice)

    const totalAmount = serviceCharge + orderPrice;

    const config = {
        reference: paymentRef,
        email: data ? data[0]?.customer?.email : null,
        name: data ? data[0]?.customer?.name : null,
        amount: totalAmount * 100,
        publicKey: 'pk_test_6cf85813bd75ff7ae5c04a8f109a174b9093be3c',
    };

    const handlePayment = async () => {
        try {
            setLoading(true)
            const res = await client().get(`/orders/init-payment/${orderRef}?transactionRef=${paymentRef}`)
            const transactionRef = res?.data?.result?.transactionRef as string;
            return transactionRef;
        } catch (err) {
            setLoading(false)
            toast(err?.response?.data?.message, "Contact Support Support!").error()
        }
    }

    const paystackConsumerProps = {
        ...config,
        onSuccess: (response) => {
            console.log(response)
            //verify payment
            client().get(`/orders/verify-payment/${orderRef}?transactionRef=${response?.reference}`)
                .then(res => {
                    queryClient.setQueryData(["orderRef", orderRef], (data: Order[] | null) => {
                        if (!data) return;
                        return data.map(item => ({ ...item, userPaid: true }))
                    })
                    setLoading(false)
                    toast("You would be updated via mail!",
                        'Payment Successful!').success()
                }).catch(err => {
                    setLoading(false)
                    toast(err?.response?.data?.message, "Contact Support Support!").error()
                })
        },
        onClose: () => {
            setLoading(false)
            toast("Payment failed!").error()
        }

    }

    return (
        <Flex direction={"column"} h={"100vh"} >
            <Flex direction={"column"} mx={"auto"}
                my={"auto"}>
                <Flex
                    align={"center"}
                    maw={500}
                    direction={'column'}
                    className="border shadow-sm rounded-3xl"
                    p={20}>
                    {isLoading ? <LoadingOverlay visible zIndex={1000} w={"100%"}
                        overlayProps={{ radius: "sm", blur: 2 }} /> :
                        <>
                            <Logo />
                            {data && !data[0]?.userPaid ?
                                <Flex my={20} direction={'column'}>
                                    <Text fw={600} size={"xl"} ta={"center"} mb={10}>Hi there 👋</Text>
                                    <Text fz={"md"}>Make payment to complete the process of your order. Order ID - #{orderRef}</Text>
                                    <Flex justify={"space-between"} my={10} direction={"column"}>

                                        <Flex justify={"space-between"}>
                                            <Text size="sm">Original cost:  </Text>
                                            <NumberFormatter
                                                className="text-sm"
                                                thousandSeparator
                                                prefix="₦"
                                                value={orderPrice} />
                                        </Flex>
                                        <Divider my={10} />
                                        <Flex justify={"space-between"}>
                                            <Text size="sm">Service charge:  </Text>
                                            <NumberFormatter
                                                className="text-sm"
                                                thousandSeparator
                                                prefix="₦"
                                                value={serviceCharge} />
                                        </Flex>

                                        <Divider my={10} />

                                        <Flex justify={"space-between"}>
                                            <Text size="sm">Total:
                                            </Text>
                                            <NumberFormatter
                                                thousandSeparator
                                                prefix="₦"
                                                value={totalAmount} />
                                        </Flex>
                                    </Flex>

                                    <PaystackConsumer
                                        {...paystackConsumerProps}
                                    >
                                        {({ initializePayment }) => (
                                            <Flex justify={"flex-end"} my={20}>
                                                <Button size="sm"
                                                    loading={loading}
                                                    onClick={async () => {
                                                        try {
                                                            const res = await handlePayment()
                                                            if (res) {
                                                                initializePayment()
                                                            }
                                                        } catch (err) {
                                                            setLoading(false)
                                                            toast(err?.response?.data?.message, "Contact Support Support!").error()
                                                        }
                                                    }}>
                                                    Make Payment
                                                </Button>
                                            </Flex>
                                        )}</PaystackConsumer>
                                </Flex>
                                :
                                <Flex my={20} direction={'column'}>
                                    <Text fw={500} size={"xl"} ta={"center"} mb={10}>Hi there 👋</Text>
                                    <Flex direction={"column"} my={20}>
                                        <CheckCircle size={100} color="#228be6" className="mx-auto" />
                                        <Text my={10}>This Order has been paid for already,
                                            contact support if you have any complaint.</Text>
                                    </Flex>
                                </Flex>
                            }
                        </>
                    }
                </Flex>
                <Flex
                    mx={"auto"}
                    maw={500} my={10} p={20}>
                    <Text fw={300} size="sm">24/7 support via support@escrowsystem.com or +234 705 215 2823</Text>
                </Flex>
            </Flex>

        </Flex>
    );
}

export default PaymentPage;