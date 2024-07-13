import { useUserContext } from "@/context/UserContext";
import { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Order as OrderType, order_status, user_role } from "@/shared/types";
import {
    Badge, Center, Flex, List, NumberFormatter,
    Select,
    Skeleton, Spoiler, Table, Text
} from "@mantine/core";
import AppSkeleton from "@/components/AppSkeleton";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";


const SuccessfullPendingDeliveries = () => {
    const clientInstance = useClient()
    const { user } = useUserContext()
    const { companyId } = useParams()
    const queryClient = useQueryClient()
    const isAdmin = user?.role === user_role.admin

    const [orderStatus, setOrderStatus] = useState<order_status | "all" | null>("all")

    const { data, isLoading } = useQuery({
        queryKey: ["successfull-orders", companyId ?? user?.id],
        queryFn: () => clientInstance().get(
            isAdmin ? "/orders/all?status=delivered" :
                `/orders/company-orders/${companyId ?? user?.companyId}?status=delivered`)
            .then(res => {
                const orders = res.data?.result as OrderType[]
                return {
                    orders,
                    result: orders
                }
            })
            .catch(err => {
                toast(err?.response?.data?.message).error();
                return {
                    result: [] as OrderType[],
                    orders: [] as OrderType[]
                }
            }),
    })

    const isNotVendor = (user?.role === user_role.admin) || (user?.role === user_role.company)


    useEffect(() => {
        queryClient.setQueryData(
            ["successfull-orders", companyId ?? user?.id],
            (data: {
                result: OrderType[],
                orders: OrderType[]
            } | null) => {
                if (!data) return;
                const { orders } = data;
                return {
                    orders,
                    result: !orderStatus ? orders : orderStatus === "all" ?
                        orders : orders?.filter(item =>
                            orderStatus === order_status.delivery_confirmed
                                ? item.userReceived : !item.userReceived)
                }
            })

    }, [orderStatus])


    return (
        <>
            {isLoading && <Flex w={"100%"}>
                <Skeleton w={"100%"} h={50} />
            </Flex>}
            <Flex justify={"flex-end"}>
                <Select
                    value={orderStatus}
                    onChange={setOrderStatus}
                    label="Delivery"
                    w={200}
                    data={[
                        { label: "All", value: "all" },
                        { label: "Delivery Confirmed", value: order_status.delivery_confirmed },
                        { label: "Pending Confirmation", value: order_status.pending_confirmation }
                    ]} />
            </Flex>
            <Table
                striped="even"
                horizontalSpacing={"md"}
                verticalSpacing={"md"}
            >
                {!isLoading && <Table.Thead >
                    <Table.Tr>
                        <Table.Th>Ref./ID</Table.Th>
                        <Table.Th>Customer</Table.Th>
                        {isNotVendor && <Table.Th>Vendor</Table.Th>}
                        <Table.Th>Product</Table.Th>
                        <Table.Th>Delivered</Table.Th>
                        <Table.Th>Customer Confirmed</Table.Th>
                    </Table.Tr>
                </Table.Thead>}
                <Table.Tbody>
                    {data?.result && data?.result.length > 0 ? <>
                        {data.result.map(item => (
                            <Table.Tr>
                                <Table.Td>
                                    <Text size="sm">
                                        {item.orderRef}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Flex direction={"column"}>
                                        <Text fz="sm">{item?.customer?.name}</Text>
                                        <Text fz={"xs"} c={"dimmed"}>{item.customer?.email}</Text>
                                        {/* <Link
                                            to={"#"}
                                            className="text-color-1 text-xs underline">more orders</Link> */}
                                    </Flex>
                                </Table.Td>

                                {isNotVendor && <Table.Td>
                                    <Text fz="sm">{item?.vendor?.name}</Text>
                                    <Text fz={"xs"} c={"dimmed"}>{item?.vendor?.email}</Text>
                                    <Link
                                        to={"#"}
                                        className="text-color-1 text-xs underline">more orders</Link>
                                </Table.Td>}


                                <Table.Td maw={500}>
                                    <Flex direction={"column"} >
                                        <Spoiler maxHeight={40} showLabel="Show more" hideLabel="Hide">
                                            <List listStyleType="disc">
                                                {item.products.map(item => (
                                                    <List.Item >
                                                        <Text size="sm">id: {item.id}, name: {item.name}, amount: <NumberFormatter
                                                            thousandSeparator
                                                            prefix="₦"
                                                            value={+item.price} /></Text>
                                                        {item.details && <Text size="sm">details:{item.details}</Text>}
                                                    </List.Item>
                                                ))}
                                            </List>
                                        </Spoiler>
                                    </Flex>
                                </Table.Td>

                                <Table.Td>
                                    {item.vendorDelivered}
                                    <Badge
                                        // size=""
                                        color={item.vendorDelivered ? "green" : "orange"}>
                                        {item.vendorDelivered ? "success" : "pending"}
                                    </Badge>
                                </Table.Td>

                                <Table.Td>
                                    <Badge color={item.userReceived ? "green" : "orange"}>
                                        {item.userReceived ? "success" : "pending"}
                                    </Badge>
                                </Table.Td>

                            </Table.Tr>
                        ))}
                    </> : null}

                    {isLoading && <>
                        {Array(3).fill(null).map(_item => (
                            <Table.Tr>
                                <Table.Td>
                                    <AppSkeleton count={2} width={150} height={20} />
                                    <Skeleton width={100} height={15} />
                                </Table.Td>
                                <Table.Td>
                                    <AppSkeleton count={2} width={150} height={20} />
                                    <Skeleton width={100} height={15} />
                                </Table.Td>
                                <Table.Td>
                                    <AppSkeleton count={3} width={150} height={20} />
                                </Table.Td>
                                <Table.Td>
                                    <Skeleton width={100} height={20} radius={20} />
                                </Table.Td>
                                <Table.Td>
                                    <Skeleton width={100} height={20} radius={20} />
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </>}
                </Table.Tbody>
            </Table>
            {data?.result?.length === 0 &&
                <Center my={50}>
                    <Text>No data found</Text>
                </Center>
            }
        </>
    );
}

export default SuccessfullPendingDeliveries;