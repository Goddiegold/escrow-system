import AppSkeleton from "@/components/AppSkeleton";
import BackBtn from "@/components/shared/BackBtn";
import usePagination from "@/hooks/usePagination";
import { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { Company } from "@/shared/types";
import { Button, Card, Center, Flex, Table, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import moment from "moment"
import { useNavigate } from "react-router-dom";

const RegisteredCompanies = () => {
    const clientInstance = useClient()
    const { data, isLoading } = useQuery({
        queryKey: ["registered-companies"],
        queryFn: () => clientInstance().get("/companies/all-companies")
            .then(res => {
                return res?.data?.result as Company[]
            }).catch(err => {
                toast(err?.response?.data.message).error()
                return [] as Company[]
            })
    })

    const itemsPerPage = 10

    const { PaginationBtn, data: paginatedData } = usePagination(data ?? [], itemsPerPage)

    const navigate = useNavigate()
    return (
        <Flex direction={"column"}>
            <Flex my={10} align={"center"} justify={"space-between"}>
                <BackBtn />
            </Flex>
            <Card shadow="sm" padding="sm" radius="md" withBorder>
                {isLoading ? <>
                    <AppSkeleton count={5} height={50} className="my-[10px]" />
                </> :
                    <>
                        <Table
                            horizontalSpacing={"md"}
                            verticalSpacing={"md"}
                        >
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th>Registered On</Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data && data?.length &&
                                    <>
                                        {paginatedData.map((item, key) => (
                                            <Table.Tr key={key}>
                                                <Table.Td>
                                                    {item.name}
                                                </Table.Td>
                                                <Table.Td>
                                                    {moment(item?.createdAt).format("DD MMMM, YYYY")}
                                                </Table.Td>
                                                <Table.Td>
                                                    <Button
                                                        variant="transparent"
                                                        onClick={() => navigate(`/dashboard/company-orders/${item.id}`)}>
                                                        Orders
                                                    </Button>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </>
                                }
                            </Table.Tbody>
                        </Table>

                        <Center my={10}>
                            {paginatedData?.length > itemsPerPage && <PaginationBtn />}
                            {!data?.length && <Text>No data Found</Text>}
                        </Center>
                    </>
                }
            </Card>
        </Flex >
    );
}

export default RegisteredCompanies;