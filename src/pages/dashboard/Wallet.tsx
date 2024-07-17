import { useUserContext } from "@/context/UserContext";
import { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { Order } from "@/shared/types";
import { ActionIcon, Button, Card, Flex, Modal, NumberFormatter, NumberInput, Paper, SegmentedControl, Skeleton, Space, Text, TextInput } from "@mantine/core";
import { useColorScheme, useDisclosure } from "@mantine/hooks";
import { DotsThreeVertical, Eye, EyeSlash, Package, Truck } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const WalletPage = () => {
    const { user } = useUserContext()
    const color = useColorScheme()
    const isDark = color === "dark";
    const iconColor = !isDark ? "black" : "gray"
    const clientInstance = useClient()
    const [balIsVisible, setBalIsVisible] = useState(true)
    const [selectedOption, setSelectedOption] = useState('Credit');
    const [opened, { open, close }] = useDisclosure(false);

    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ["wallet_history", user?.id],
        queryFn: async () => {
            try {
                const res = await clientInstance().get("/users/payment-history")
                return res.data?.result as Order[]
            } catch (error) {
                toast(error?.response?.data?.message).error()
            }
        }
    })

    const isFetching = isLoading || isLoading;

    return (
        <>
            <Flex mih={"100vh"} maw={500} direction={"column"}>

                {!isFetching ?
                    <>
                        <Paper w={"100%"} h={150} p={"md"} shadow="sm">
                            <Flex justify={"space-between"}>
                                <Flex direction={"column"}>
                                    <Flex align={"center"}>
                                        <Text size="sm">Total balance</Text>
                                        <Space mx={"md"} />
                                        <ActionIcon variant="transparent" onClick={() => setBalIsVisible(!balIsVisible)}>
                                            {balIsVisible ? <EyeSlash size={20} color={iconColor} /> :
                                                <Eye size={20} color={iconColor} />}
                                        </ActionIcon>
                                    </Flex>
                                    <Text fz={25} fw={600}>
                                        {balIsVisible ? <NumberFormatter
                                            thousandSeparator
                                            prefix="₦"
                                            value={user?.wallet || 0} /> : "₦ * * * * * *"}

                                    </Text>
                                </Flex>
                                {/* <ActionIcon variant="transparent">
                                <DotsThreeVertical size={20} color={iconColor} weight="bold" />
                            </ActionIcon> */}
                                <Button variant="transparent" onClick={open}>Withdraw</Button>
                            </Flex>
                        </Paper>

                        <Card my={"md"} shadow="sm">
                            <SegmentedControl
                                value={selectedOption}
                                onChange={setSelectedOption}
                                my={"md"}
                                fullWidth
                                data={['Credit', 'Debit']} />

                            <Flex direction={"column"} my={"md"}>
                                {data?.map(item => (
                                    <Flex className="border-b" justify={"space-between"} p={"sm"} align={"center"}>
                                        <Text fz={"sm"}>
                                            <Truck size={20} weight="duotone" />
                                            Delivery of order {item?.orderRef}</Text>
                                        <Text fz={"sm"} c={"green"} fw={600}>
                                            {balIsVisible ? <NumberFormatter
                                                thousandSeparator
                                                prefix="₦"
                                                value={item?.totalAmount} /> : "₦ * * * * *"}
                                        </Text>
                                    </Flex>
                                ))}
                            </Flex>
                        </Card>
                    </> :
                    <>
                        <Skeleton w={"100%"} h={150} p={"md"} />
                        <Skeleton my={"md"} width={"100%"} h={500} />
                    </>
                }

            </Flex>

            <Modal opened={opened} onClose={close} withCloseButton centered title={<Text fw={600}>Withdraw</Text>}>
                <NumberInput
                leftSection={<Text size="md">₦</Text>}
                    label="Amount"
                    placeholder="e.g 500"
                    // prefix="₦"
                     thousandSeparator=","
                    // defaultValue={100}
                    mb="md"
                />
                <Flex justify={"flex-end"}>
                <Button>
                    Proceed
                </Button>
                </Flex>
            </Modal>
        </>
    );
}

export default WalletPage;