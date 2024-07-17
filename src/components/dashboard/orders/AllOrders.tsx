import { useUserContext } from "@/context/UserContext";
import { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { useQuery } from "@tanstack/react-query";
import { Order as OrderType, order_status, user_role } from "@/shared/types";
import {
    Badge, Center, Flex, List, NumberFormatter,
    Skeleton, Spoiler, Table, Text
} from "@mantine/core";
import AppSkeleton from "@/components/AppSkeleton";
import { useParams } from "react-router-dom";
import useSearchOrders from "@/hooks/useSearchOrders";
import usePagination from "@/hooks/usePagination";

const AllOrders = () => {

    const clientInstance = useClient()
    const { user } = useUserContext()
    const { companyId } = useParams()
    const isAdmin = user?.role === user_role.admin


    const { data, isLoading } = useQuery({
        queryKey: ["all-orders", companyId ?? user?.id],
        queryFn: () => clientInstance().get(
            !isAdmin ?
                `/orders/company-orders/${companyId ?? user?.companyId}` : "/orders/all"
        )
            .then(res => res.data?.result as OrderType[])
            .catch(err => {
                toast(err?.response?.data?.message).error();
                return [] as OrderType[]
            }),
    })

    const { SearchInput, queryResult,
        query, dataNotFound, dataFound } = useSearchOrders(data || [])
    const itemsPerPage = 5;
    const { PaginationBtn, data: paginatedData } = usePagination((!query ? data : queryResult) || [],
        itemsPerPage)

    const isNotVendor = (user?.role === user_role.admin) || (user?.role === user_role.company)

    return (
        <>
            {isLoading && <Flex w={"100%"}>
                <Skeleton w={"100%"} h={50} />
            </Flex>}

            {!isLoading && <SearchInput />}

            <Table
                striped="even"
                horizontalSpacing={"md"}
                verticalSpacing={"xs"}
            >
                {!isLoading && <Table.Thead >
                    <Table.Tr>
                        <Table.Th>Ref./ID</Table.Th>
                        <Table.Th>Customer</Table.Th>
                        {isNotVendor && <Table.Th>Vendor</Table.Th>}
                        <Table.Th>Product</Table.Th>
                        {isNotVendor && <Table.Th>User Paid</Table.Th>}
                        <Table.Th>Delivered</Table.Th>
                        <Table.Th>Customer Confirmed</Table.Th>
                    </Table.Tr>
                </Table.Thead>}
                <Table.Tbody>
                    {data && data?.length > 0 ? <>
                        {paginatedData.map(item => (
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
                                    </Flex>
                                </Table.Td>

                                {isNotVendor && <Table.Td>
                                    <Text fz="sm">{item?.vendor?.name}</Text>
                                    <Text fz={"xs"} c={"dimmed"}>{item?.vendor?.email}</Text>
                                </Table.Td>}

                                <Table.Td>
                                    <Flex direction={"column"} w={200}>
                                        <Spoiler maxHeight={40} showLabel="Show more" hideLabel="Hide" classNames={{
                                            control: "text-xs"
                                        }}>
                                            <List listStyleType="disc" >
                                                {item.products.map(item => (
                                                    <List.Item >
                                                        <Text size="sm">id: {item.id}, name: {item.name}, price: <NumberFormatter
                                                            thousandSeparator
                                                            prefix="₦"
                                                            value={item.price} /></Text>
                                                        {item.details && <Text size="sm">details:{item.details}</Text>}
                                                    </List.Item>
                                                ))}
                                            </List>
                                        </Spoiler>
                                    </Flex>
                                </Table.Td>

                              {isNotVendor && <Table.Td>
                                    <Badge
                                        color={item.userPaid ? "green" : "red"}>{item?.userPaid ? "Paid" : "Not Paid"}</Badge>
                                </Table.Td>}

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
                                        {item.userReceived ? "success" : "pending"}
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

            {!isLoading && <Center my={dataNotFound ? 50 : 0}>
                {dataNotFound ?
                    <Text>No data found</Text>
                    :
                    <>
                        {dataFound && <PaginationBtn />}
                    </>
                }
            </Center>}
        </>
    );
}

export default AllOrders;