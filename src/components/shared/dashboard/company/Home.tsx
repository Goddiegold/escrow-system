import AppCard from "@/components/shared/AppCard";
import { useUserContext } from "@/context/UserContext";
import { useClient } from "@/shared/client";
import { toast } from "@/shared/helpers";
import { Order, User, order_status, user_role } from "@/shared/types";
import { Grid, Skeleton } from "@mantine/core";
import { Handshake, ShoppingCartSimple } from "@phosphor-icons/react";
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

    const [vendors, orders] = queryResult;

    const cardData = [
        {
            title: "Registered Vendors",
            action: "view vendors",
            count: vendors?.data?.length ?? 0,
            path: "/dashboard/registered-vendors",
            icon: Handshake
        },
        {
            title: "All Orders",
            action: "view orders",
            count: orders?.data?.length ?? 0,
            path: "/dashboard/orders",
            icon: ShoppingCartSimple
        },
    ]

    const isLoading = queryResult.find(item => item.isLoading)


    return (
        <>
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
                                icon={item.icon}
                            />
                        </Grid.Col>
                    ))
                }
            </>}
        </>
    );
}

export default DashboardHome;