import AppCard from "@/components/shared/AppCard";
import { useUserContext } from "@/context/UserContext";
import { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { Order } from "@/shared/types";
import { Grid, Skeleton } from "@mantine/core";
import { Handshake } from "@phosphor-icons/react";
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

    const [orders] = queryResult;

    const cardData = [
        {
            title: "Orders",
            action: "view orders",
            count: orders?.data?.length ?? 0,
            path: "/dashboard/orders",
            icon: Handshake
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