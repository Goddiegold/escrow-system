import { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Order as OrderType, order_status } from "@/shared/types";
import {
    Badge, Card, Center, Flex, List, NumberFormatter,
    ScrollArea,
    Select,
    Skeleton, Spoiler, Table, Text
} from "@mantine/core";
import AppSkeleton from "@/components/AppSkeleton";
import { useParams } from "react-router-dom";
import BackBtn from "../../components/shared/BackBtn";
import { useEffect, useState } from "react";
import usePagination from "@/hooks/usePagination";

const AllVendorOrders = () => {
    const clientInstance = useClient()
    const { vendorId, companyId } = useParams()
    const [selectedOrderStatus, setSelectedOrderStatus] = useState<order_status | "all">("all")
    const queryClient = useQueryClient()

    const queryKey = vendorId ? ["vendor-orders", vendorId] : ["company_orders", companyId]
    console.log("vendorId", vendorId)
    console.log("companyId", companyId)
    const { data, isLoading } = useQuery({
        queryKey,
        queryFn: () => clientInstance().get(
            vendorId ? `/orders/vendor-orders/${vendorId}` :
                `/orders/company-orders/${companyId}`)
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
        queryClient.setQueryData(queryKey,
            (data: { orders: OrderType[], result: OrderType[] } | null) => {
                if (data) {
                    const { orders } = data;
                    return {
                        orders,
                        result: !selectedOrderStatus ? orders : selectedOrderStatus === "all" ?
                            orders : orders?.filter(item => {
                                if (selectedOrderStatus === order_status.delivery_confirmed) {
                                    return item.userReceived
                                }

                                if (selectedOrderStatus === order_status.pending_confirmation) {
                                    return (!item.userReceived && item.order_status === order_status.delivered)
                                }
                                return item.order_status === selectedOrderStatus
                            }
                            )
                    }
                }
            })
    }, [selectedOrderStatus])

    const { PaginationBtn, data: paginatedData } = usePagination(data?.result ?? [])

    return (
        <>
            <Flex direction={"column"}>
                <Flex align={"center"} justify={"space-between"} my={10}>
                    <BackBtn />
                    <Select
                        // size="xs"
                        value={selectedOrderStatus}
                        onChange={setSelectedOrderStatus}
                        label="Order Status"
                        data={[
                            { label: "All", value: "all" },
                            { label: "Cancelled", value: order_status.cancelled },
                            { label: "Delivered", value: order_status.delivered },
                            { label: "Pending Delivery", value: order_status.pending },
                            { label: "Delivery Confirmed", value: order_status.delivery_confirmed },
                            { label: "Pending Confirmation", value: order_status.pending_confirmation }
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
                                {paginatedData.map(item => (
                                    <Table.Tr>
                                        <Table.Td>
                                            <Flex direction={"column"}>
                                                <Text fz="sm">{item?.customer?.name}</Text>
                                                <Text fz={"xs"} c={"dimmed"}>{item.customer?.email}</Text>
                                            </Flex>
                                        </Table.Td>

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
                    <Center my={50}>
                        {data?.result?.length === 0 ?
                            <Text>No data found</Text>
                            :
                            <PaginationBtn />
                        }

                    </Center>
                </Card>
            </Flex>
        </>
    );
}

export default AllVendorOrders;