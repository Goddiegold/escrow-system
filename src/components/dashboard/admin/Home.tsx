import AppCard from "@/components/shared/AppCard";
import { useUserContext } from "@/context/UserContext";
import { useClient } from "@/shared/client";
import { convertAmount, toast } from "@/shared/helpers";
import { Company, User, user_role, Order as OrderType } from "@/shared/types";
import { Grid, Skeleton } from "@mantine/core";
import { BuildingOffice, Coins, Handshake, ShoppingCartSimple } from "@phosphor-icons/react";
import { useQueries } from "@tanstack/react-query";

const Home = () => {
  const clientInstance = useClient()
  const { user } = useUserContext()

  const queryResult = useQueries({
    queries: [
      {
        queryKey: ["registered-companies"],
        queryFn: () => clientInstance().get("/companies/all-companies")
          .then(res => {
            return res?.data?.result as Company[]
          }).catch(err => {
            toast(err?.response?.data.message).error()
            return [] as Company[]
          }),
        refetchInterval: 60000,
      },
      {
        queryKey: ["registered-vendors", user?.id],
        queryFn: () => clientInstance().get(`/companies/get-users?role=${user_role.vendor}`)
          .then(res => res?.data?.result as User[])
          .catch(err => {
            toast(err?.reponse?.data?.messsage).error()
            return [] as User[]
          }),
        refetchInterval: 60000,
      },
      {
        queryKey: ["all-orders", user?.id],
        queryFn: () => clientInstance().get("/orders/all")
          .then(res => res.data?.result as OrderType[])
          .catch(err => {
            toast(err?.response?.data?.message).error();
            return [] as OrderType[]
          }),
        refetchInterval: 60000,
      }
    ]
  })

  const isLoading = queryResult.some(item => item.isLoading);
  const [{ data: companies }, { data: vendors }, { data: orders }] = queryResult;

  const totalAmount = (orders && orders?.length > 0) ? orders?.filter(item => (item.userPaid && item.vendorDelivered && item.userReceived)).reduce((accumulator, currentItem) => {
    return accumulator + currentItem.totalAmount;
  }, 0) : 0;

  const cardData = [
    {
      totalNumber: companies?.length ?? 0,
      title: "Companies", icon: BuildingOffice,
      action: "view companies",
      actionPath: "/dashboard/registered-companies"
    },
    {
      totalNumber: vendors?.length ?? 0, title: "Vendors",
      icon: Handshake, action: "view vendors",
      actionPath: "/dashboard/registered-vendors"
    },
    {
      totalNumber: orders?.length ?? 0, title: "Orders",
      icon: ShoppingCartSimple, action: "view orders",
      actionPath: "/dashboard/orders"
    },
    {
      title: "Total Transaction Amount",
      action: "view orders",
      totalNumber: `₦${convertAmount(totalAmount!)}`,
      actionPath: "/dashboard/orders/successfull-deliveries",
      icon: Coins
    },
  ]
  return (
    <Grid>
      {isLoading ? <>
        {Array(5).fill(null).map((item, key) => (
          <Grid.Col
            key={key}
            span={{ base: 12, xs: 12, md: 6, lg: 4 }}>
            <Skeleton
              className="sm:h-[150px] h-[170px] rounded-xl"
              mr={10} />
          </Grid.Col>
        ))}
      </> :
        <>
          {
            cardData.map((item, key) => (
              <Grid.Col
                key={key}
                span={{ base: 12, xs: 12, md: 6, lg: 4 }}>
                <AppCard
                  {...item}
                />
              </Grid.Col>
            ))
          }
        </>
      }

    </Grid>
  );
}

export default Home;