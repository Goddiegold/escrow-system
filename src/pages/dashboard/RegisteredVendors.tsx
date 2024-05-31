import BackBtn from "@/components/shared/BackBtn";
import { useUserContext } from "@/context/UserContext";
import { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { User, user_role } from "@/shared/types";
import { Card, Flex, Skeleton, Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const elements = [
    { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
    { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
    { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
    { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
    { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
];

const RegisteredVendors = () => {
    const { user } = useUserContext()
    const isAdmin = user?.role === user_role.admin;
    const clientInstance = useClient();

    const { data, isLoading } = useQuery({
        queryKey: isAdmin ? ["registered-vendors"] : ["registered-vendors", isAdmin],
        queryFn: () => clientInstance().get(`/companies/get-users?role=${user_role.vendor}`)
            .then(res => res?.data?.result as User[])
            .catch(err => {
                toast(err?.reponse?.data?.messsage).error()
                return [] as User[]
            })
    })

    return (
        <Flex direction={"column"}>
            <Flex justify={"flex-start"} my={10}>
                <BackBtn />
            </Flex>
            <Card shadow="sm" padding="sm" radius="md" withBorder>
                {isLoading && <Flex w={"100%"}>
                    <Skeleton w={"100%"} h={50} />
                </Flex>}
                <Table
                    horizontalSpacing={"md"}
                    verticalSpacing={"md"}
                >
                    {!isLoading && <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Email</Table.Th>
                        </Table.Tr>
                    </Table.Thead>}
                    <Table.Tbody>
                        {data && data?.length > 0 ? <>
                            {data.map(item => (
                                <Table.Tr>
                                    <Table.Td>
                                        {item.name}
                                    </Table.Td>
                                    <Table.Td>
                                        {item.email}
                                    </Table.Td>
                                    <Table.Td>
                                        <Link to={"#"} className="text-color-1 underline">Orders</Link>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </> : <></>}

                        {isLoading && <>
                            {Array(3).fill(null).map(item => (
                                <Table.Tr>
                                    <Table.Td>
                                        <Skeleton width={200} height={15} />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton width={200} height={15} />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton width={100} height={20} />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </>}
                    </Table.Tbody>
                </Table>
            </Card>
        </Flex>
    );
}

export default RegisteredVendors;