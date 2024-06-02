import { useUserContext } from "@/context/UserContext";
import { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { useQuery } from "@tanstack/react-query";
import { Order as OrderType } from "@/shared/types";
import {
    Badge, Center, Flex, NumberFormatter,
    Skeleton, Table, Text
} from "@mantine/core";
import AppSkeleton from "@/components/AppSkeleton";
import { Link } from "react-router-dom";


const SuccessfullPendingDeliveries = () => {
    const clientInstance = useClient()
    const { user } = useUserContext()

    const { data, isLoading } = useQuery({
        queryKey: ["successfull-orders", user?.companyId, user?.id],
        queryFn: () => clientInstance().get(`/orders/company-orders/${user?.companyId}?status=success`)
            .then(res => res.data?.result as OrderType[])
            .catch(err => {
                toast(err?.response?.data?.message).error();
                return [] as OrderType[]
            }),
    })

    return (
        <>
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
                    {data && data?.length > 0 ? <>
                        {data.map(item => (
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
                                    {item.vendorDelivered}
                                    <Badge
                                        // size=""
                                        color={item.vendorDelivered ? "green" : "orange"}>
                                        {item.vendorDelivered ? "success" : "pending"}
                                    </Badge>
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
            {data?.length === 0 &&
                <Center my={50}>
                    <Text>No data found</Text>
                </Center>
            }
        </>
    );
}

export default SuccessfullPendingDeliveries;