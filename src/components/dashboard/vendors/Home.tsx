import AppCard from "@/components/shared/AppCard";
import { useUserContext } from "@/context/UserContext";
import { useClient } from "@/shared/client";
import { convertAmount, toast } from "@/shared/helpers";
import { Order } from "@/shared/types";
import { Grid, Skeleton } from "@mantine/core";
import { Coins, Handshake } from "@phosphor-icons/react";
import { useQueries } from "@tanstack/react-query";

const DashboardHome = () => {
    const clientInstance = useClient()
    const { user } = useUserContext()

    const queryResult = useQueries({
        queries: [
            {
                queryKey: ["orders", user?.companyId, user?.id],
                queryFn: () => clientInstance().get(`/orders/company-orders/${user?.companyId}`)
                    .then(res => res.data?.result as Order[])
                    .catch(err => {
                        toast(err?.response?.data?.message).error();
                        return [] as Order[]
                    }),
            }
        ]
    })

    const isLoading = queryResult.find(item => item.isLoading)

    const [{ data: orders }] = queryResult;

    const totalAmount = (orders && orders?.length > 0) ? orders?.filter(item => (item.userPaid && item.vendorDelivered  && item.userReceived)).reduce((accumulator, currentItem) => {
        return accumulator + currentItem.totalAmount;
    }, 0) : 0;

    const cardData = [
        {
            title: "Orders",
            action: "view orders",
            count: orders?.length ?? 0,
            path: "/dashboard/orders",
            icon: Handshake
        },
        {
            title: "Total Amount Made",
            action: "view orders",
            count: `₦${convertAmount(totalAmount!)}`,
            path: "/dashboard/orders/successfull-deliveries",
            icon: Coins
        },
    ]

    return (
        <>
            <Grid>
                {isLoading ? <>{
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
                                // icon={item.icon}
                                />
                            </Grid.Col>
                        ))
                    }
                </>}
            </Grid>
        </>
    );
}

export default DashboardHome;