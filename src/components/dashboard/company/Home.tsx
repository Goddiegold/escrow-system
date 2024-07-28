import AppCard from "@/components/shared/AppCard";
import { useUserContext } from "@/context/UserContext";
import { useClient } from "@/shared/client";
import { convertAmount, toast } from "@/shared/helpers";
import { Order, User, order_status, user_role } from "@/shared/types";
import { Flex, Grid, Skeleton } from "@mantine/core";
import { Coins, Handshake, ShoppingCartSimple } from "@phosphor-icons/react";
import { useQueries } from "@tanstack/react-query";

const DashboardHome = () => {
    const { user, isLoggedIn } = useUserContext()
    const clientInstance = useClient()

    const allowRequest = isLoggedIn && !!user?.companyId;

    const queryResult = useQueries({
        queries: [
            {
                queryKey: ["vendors", user?.companyId],
                queryFn: () => clientInstance().get(`/companies/get-users?role=${user_role.vendor}`)
                    .then(res => res?.data?.result as User[])
                    .catch(err => {
                        toast(err?.response?.data?.message).error();
                        return [] as User[]

                    })
                ,
                enabled: allowRequest,
            },
            {
                queryKey: ["orders", user?.companyId],
                queryFn: () => clientInstance().get(`/orders/company-orders/${user?.companyId}`)
                    .then(res => res.data?.result as Order[])
                    .catch(err => {
                        toast(err?.response?.data?.message).error();
                        return [] as Order[]
                    }),
                enabled: allowRequest,
            }
        ]
    })

    const [{ data: vendors }, { data: orders }] = queryResult;

    const totalAmount = (orders && orders?.length > 0) ? orders?.filter(item => (item.userPaid && item.vendorDelivered  && item.userReceived)).reduce((accumulator, currentItem) => {
        return accumulator + currentItem.totalAmount;
    }, 0) : 0;

    const cardData = [
        {
            title: "Registered Vendors",
            action: "view vendors",
            count: vendors?.length ?? 0,
            path: "/dashboard/registered-vendors",
            icon: Handshake
        },
        {
            title: "All Orders",
            action: "view orders",
            count: orders?.length ?? 0,
            path: "/dashboard/orders",
            icon: ShoppingCartSimple
        },
        {
            title: "Total Transaction Amount",
            action: "view orders",
            count: `₦${convertAmount(totalAmount!)}`,
            path: "/dashboard/orders/successfull-deliveries",
            icon: Coins
        },
    ]

    const isLoading = queryResult.find(item => item.isLoading)


    return (
        <Flex direction={"column"} w={"100%"}>
            <Grid>
                {
                    isLoading ? <>{
                        Array(3).fill(null).map((item, key) => (
                            <Grid.Col
                                key={key}
                                span={{ base: 12, xs: 12, md: 6, lg: 4 }}>
                                <Skeleton
                                    className="sm:h-[150px] h-[170px] rounded-xl"
                                    mr={10} />
                            </Grid.Col>
                        ))
                    }</> : <>
                        {
                            cardData?.map((item, key) => (
                                <Grid.Col
                                    key={key}
                                    span={{ base: 12, xs: 12, md: 6, lg: 4 }}>
                                    <AppCard
                                        totalNumber={item?.count}
                                        title={item.title}
                                        action={item.action}
                                        actionPath={item.path}
                                        icon={item.icon}
                                    />
                                </Grid.Col>
                            ))
                        }
                    </>}
            </Grid>

            {/* <BarChart
                // component={ScrollArea.Autosize}
                maw={400}
                mt={40}
                h={300}
                data={data}
                withLegend
                legendProps={{ verticalAlign: 'bottom', height: 50 }}
                yAxisProps={{ domain: [0, orders?.data?.length] }}
                dataKey="name"
                type="default"
                series={[
                    { name: 'Pending', color: 'gold' },
                    { name: 'Delivered', color: 'green' },
                    { name: 'Cancelled', color: 'red' },
                ]}
            /> */}
        </Flex>
    );
}

export default DashboardHome;