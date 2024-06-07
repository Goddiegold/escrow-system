import { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Order as OrderType, order_status } from "@/shared/types";
import {
    Badge, Card, Center, Flex, NumberFormatter,
    ScrollArea,
    Select,
    Skeleton, Table, Text
} from "@mantine/core";
import AppSkeleton from "@/components/AppSkeleton";
import { Link, useParams } from "react-router-dom";
import BackBtn from "../../BackBtn";
import { useEffect, useState } from "react";

const AllVendorOrders = () => {
    const clientInstance = useClient()
    const { vendorId } = useParams()
    const [selectedOrderStatus, setSelectedOrderStatus] = useState<order_status | "all">("all")
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ["vendor-orders", vendorId],
        queryFn: () => clientInstance().get(`/orders/vendor-orders/${vendorId}`)
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
                    orders: [] as OrderType[],
                    result: [] as OrderType[]
                }
            }),
    })

    useEffect(() => {
        queryClient.setQueryData(["vendor-orders", vendorId], (data: { orders: OrderType[], result: OrderType[] } | null) => {
            if (data) {
                const { orders } = data;
                return {
                    orders,
                    result: !selectedOrderStatus ? orders : selectedOrderStatus === "all" ? orders : orders?.filter(item => item.order_status === selectedOrderStatus)
                }
            }
        })
    }, [selectedOrderStatus])

    return (
        <>
            <Flex direction={"column"}>
                <Flex align={"center"} justify={"space-between"} my={10}>
                    <BackBtn />
                    <Select
                        value={selectedOrderStatus}
                        onChange={value => setSelectedOrderStatus(value)}
                        label="Order Status"
                        data={[
                            { label: "All", value: "all" },
                            { label: "Cancelled", value: order_status.cancelled },
                            { label: "Delivered", value: order_status.delivered },
                            { label: "Pending", value: order_status.pending }
                        ]} />
                </Flex>
                <Card shadow="sm" padding="sm" radius="md" withBorder mih={500} component={ScrollArea}>
                    {isLoading && <Flex w={"100%"}>
                        <Skeleton w={"100%"} h={50} />
                    </Flex>}
                    <Table
                        striped="even"
                        horizontalSpacing={"md"}
                        verticalSpacing={"md"}
                    >
                        {!isLoading && <Table.Thead >
                            <Table.Tr>
                                <Table.Th>Customer</Table.Th>
                                <Table.Th>Product</Table.Th>
                                <Table.Th>Delivered</Table.Th>
                                <Table.Th>Customer Confirmed</Table.Th>
                            </Table.Tr>
                        </Table.Thead>}
                        <Table.Tbody>
                            {data?.result && data?.result?.length > 0 ? <>
                                {data.result.map(item => (
                                    <Table.Tr>
                                        <Table.Td>
                                            <Flex direction={"column"}>
                                                <Text fz="sm">{item?.customer?.name}</Text>
                                                <Text fz={"xs"} c={"dimmed"}>{item.customer?.email}</Text>
                                                <Link
                                                    to={"#"}
                                                    className="text-color-1 text-xs underline">more orders</Link>
                                            </Flex>
                                        </Table.Td>

                                        <Table.Td>
                                            <Flex direction={"column"}>
                                                <Text size="sm">ID: {item.productId}</Text>
                                                <Text size="sm">Name: {item.productName}</Text>
                                                <Text size="sm">Amount: <NumberFormatter
                                                    thousandSeparator
                                                    prefix="NGN "
                                                    value={item.amount} /></Text>
                                            </Flex>
                                        </Table.Td>

                                        <Table.Td>
                                            {(item.order_status === order_status.pending) ||
                                                (item.order_status === order_status.delivered) ?
                                                <Badge
                                                    color={item.order_status === order_status.delivered ? "green" : "orange"}>
                                                    {item.order_status === order_status.delivered ? "success" : "pending"}
                                                </Badge> :
                                                <Badge color="red">{item.order_status}</Badge>}
                                        </Table.Td>

                                        <Table.Td>
                                            <Badge color={item.userReceived ? "green" : "orange"}>
                                                {item.userReceived ? "" : "pending"}
                                            </Badge>
                                        </Table.Td>

                                    </Table.Tr>
                                ))}
                            </> : null}

                            {isLoading && <>
                                {Array(3).fill(null).map(item => (
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
                </Card>
            </Flex>
        </>
    );
}

export default AllVendorOrders;