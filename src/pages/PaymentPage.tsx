import Logo from "@/components/shared/Logo";
import { useClient } from "@/shared/client";
import { calculateServiceFee, toast } from "@/shared/helpers";
import { Order } from "@/shared/types";
import { Button, Divider, Flex, NumberFormatter, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

const PaymentPage = () => {
    const { orderRef } = useParams()
    const clientInstance = useClient()
    const navigate = useNavigate()
    console.log('Order Reference:', orderRef);

    const { data,
        isLoading } = useQuery({
            queryKey: ["orderRef", orderRef],
            queryFn: async () => {
                try {
                    const res = await clientInstance().get(`/orders/order-ref/${orderRef}`)
                    return res?.data?.result as { totalAmount: number }[];
                } catch (error) {
                    toast(error?.response?.data?.message).error()
                    navigate("/not-found")
                }
            },
            refetchOnMount: "always",
            enabled: !!orderRef
        })

    const orderPrice = data ? data.reduce((acc: number, item) => {
        return acc + item.totalAmount;
    }, 0) : 0;

    const serviceCharge = calculateServiceFee(orderPrice)

    const totalAmount = serviceCharge + orderPrice;

    return (
        <Flex direction={"column"} h={"100vh"}>
            <Flex
                align={'center'}
                maw={500}
                mx={"auto"}
                my={"auto"}
                // my={20}
                direction={'column'}
                className="border shadow-sm rounded-3xl"
                justify={'center'} mah={'100vh'}
                p={20}>
                <Logo />
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

                    <Flex justify={"flex-end"} my={20}>
                        <Button size="sm">
                            Make Payment
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}

export default PaymentPage;