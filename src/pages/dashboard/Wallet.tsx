import { useUserContext } from "@/context/UserContext";
import client, { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { Action_Type, notification_type, Order, withdrawal_record_type, WithdrawalRecord } from "@/shared/types";
import { ActionIcon, Badge, Button, Card, Center, Flex, Modal, NumberFormatter, NumberInput, Paper, SegmentedControl, Skeleton, Space, Text } from "@mantine/core";
import { useColorScheme, useDisclosure } from "@mantine/hooks";
import { ArrowsLeftRight, Eye, EyeSlash, Truck } from "@phosphor-icons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";



const returnTransferStatusDetails = (type: withdrawal_record_type) => {
    let color = "";
    let message = ""

    switch (type) {
        case withdrawal_record_type.pending:
            color = "yellow";
            break;
        case withdrawal_record_type.failed:
            color = "red";
            break;
        case withdrawal_record_type.reversed:
            color = "blue";
            break;
        case withdrawal_record_type.success:
            color = "green";
            break;
    }

    return {
        color,
        message
    }
}

const WalletPage = () => {
    const { user, userDispatch } = useUserContext()
    const color = useColorScheme()
    const [loading, setLoading] = useState(false)
    const isDark = color === "dark";
    const iconColor = !isDark ? "black" : "gray"
    const clientInstance = useClient()
    const [balIsVisible, setBalIsVisible] = useState(true)
    const [selectedOption, setSelectedOption] = useState('Credit');
    const [opened, { open, close }] = useDisclosure(false);
    const [amount, setAmount] = useState(null);
    const queryClient = useQueryClient()
    const queryKey = ["wallet_history", user?.id];

    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            try {
                const res = await clientInstance().get("/users/wallet-history")
                const result = res?.data?.result;
                const debits = result?.debits as WithdrawalRecord[]
                const credits = result?.credits as Order[]
                return {
                    debits,
                    credits
                }
            } catch (error) {
                toast(error?.response?.data?.message).error()
            }
        }
    })

    const isFetching = isLoading || isLoading;

    const handleWithdrawalBtn = async () => {
        try {
            if (!amount || amount < 500) {
                return toast("Enter an amount, at least ₦500").error()
            }
            setLoading(true)
            const res = await client().post("/users/make-withdrawal", { amount })
            userDispatch({
                type: Action_Type.USER_PROFILE,
                payload: { ...res?.data?.result?.user }
            })

            queryClient.setQueryData(queryKey, (data) => {
                if (!data) return;
                const debits = data!.debits as WithdrawalRecord[]
                return {
                    ...data,
                    debits: [res.data?.result?.newWithdrawal, ...debits]
                }
            })

            setLoading(false)
            close()
            toast(res?.data?.message).success()
        } catch (error) {
            setLoading(false)
            toast(error?.response?.data?.message).error()
        }
    }


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

                            {selectedOption === "Credit" ? <Flex direction={"column"} my={"md"}>

                                {data?.credits?.length > 0 ?
                                    <>
                                        {data?.credits?.map((item, idx) => (
                                            <Flex className="border-b" justify={"space-between"} p={"sm"} align={"center"} key={idx}>
                                                <Text fz={"sm"}>
                                                    <Truck size={20} weight="duotone" />
                                                    Delivery of order {item?.orderRef}</Text>

                                                <Flex direction={"column"}>
                                                    <Text fz={"sm"} c={"green"} fw={600} ta={"right"}>
                                                        {balIsVisible ? <NumberFormatter
                                                            thousandSeparator
                                                            prefix="+₦"
                                                            value={item?.totalAmount} /> : "₦ * * * * *"}
                                                    </Text>

                                                    <Text fz={"xs"}>{moment(item.userReceivedOn).format('D MMMM YYYY, h:mma')}</Text>
                                                </Flex>
                                            </Flex>
                                        ))}
                                    </> : <Center my={"md"}>
                                        <Text>No credit found</Text>
                                    </Center>}

                            </Flex> : <Flex direction={"column"} my={"md"}>
                                {data?.debits?.length > 0 ? <>
                                    {data?.debits?.map((item, idx) => {
                                        const { color, message } = returnTransferStatusDetails(item.type)
                                        return (
                                            // <Flex className="last:border-b-0 border-r-[3px] border-r-red-500 even:bg-gray-200" justify={"space-between"} p={"sm"} align={"center"} key={idx}>
                                            <Flex className="border-b" justify={"space-between"} p={"sm"} align={"center"} key={idx}>
                                                <Flex direction={"column"}>
                                                    <Text fz={"sm"}>
                                                        <ArrowsLeftRight size={20} />
                                                        Transfer to your account</Text>
                                                    {/* {renderTransferStatusBadge(item?.type)} */}
                                                    <Badge size="xs" color={color}>{item.type}</Badge>
                                                </Flex>

                                                <Flex direction={"column"}>
                                                    <Text fz={"sm"} c={"red"} fw={600} ta={"right"}>
                                                        {balIsVisible ? <NumberFormatter
                                                            thousandSeparator
                                                            prefix="-₦"
                                                            value={item?.amount} /> : "₦ * * * * *"}
                                                    </Text>
                                                    <Text fz={"xs"}>{moment(item.createdAt).format('D MMMM YYYY, h:mma')}</Text>
                                                </Flex>
                                            </Flex>
                                        )
                                    }
                                    )}
                                </> : <>
                                    <Center my={"md"}>
                                        <Text>No debit found</Text>
                                    </Center>
                                </>}
                            </Flex>}

                        </Card>
                    </> :
                    <>
                        <Skeleton w={"100%"} h={150} p={"md"} />
                        <Skeleton my={"md"} width={"100%"} h={500} />
                    </>
                }

            </Flex>

            <Modal opened={opened} onClose={() => {
                close()
                setAmount(null)
            }} withCloseButton centered title={<Text fw={600}>Withdraw</Text>}>
                <NumberInput
                    value={amount}
                    onChange={setAmount}
                    leftSection={<Text size="md">₦</Text>}
                    label="Amount"
                    placeholder="e.g 500"
                    // prefix="₦"
                    thousandSeparator=","
                    // defaultValue={100}
                    mb="md"
                />
                <Flex justify={"flex-end"}>
                    <Button onClick={handleWithdrawalBtn}
                        loading={loading}>
                        Proceed
                    </Button>
                </Flex>
            </Modal>
        </>
    );
}

export default WalletPage;