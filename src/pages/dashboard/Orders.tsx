import BackBtn from "@/components/shared/BackBtn";
import AllOrders from "@/components/shared/dashboard/vendors/orders/AllOrders";
import OrderPendingDeliveries from "@/components/shared/dashboard/vendors/orders/OrderPendingDeliveries";
import OrderSuccessfullDeliveries from "@/components/shared/dashboard/vendors/orders/OrderSuccessfullDeliveries";

import CompanyOrders from "@/components/shared/dashboard/company/orders/AllOrders";

import { useUserContext } from "@/context/UserContext";
import { user_role } from "@/shared/types";
import { Card, Flex, ScrollArea, Tabs, rem } from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import { ListChecks, ShoppingCart, XCircle } from "@phosphor-icons/react";

const Orders = () => {
    const navigate = useNavigate();
    const { tabValue } = useParams();
    const { user } = useUserContext()
    const iconStyle = { width: rem(15), height: rem(15) };

    return (
        <Flex direction={"column"}>
            <Flex justify={"flex-start"} my={10}>
                <BackBtn />
            </Flex>
            <Card shadow="sm" padding="sm" radius="md" withBorder mih={500} component={ScrollArea}>
                <Tabs defaultValue="all"
                    value={tabValue}
                    onChange={value => navigate(`/dashboard/orders/${value}`)}>
                    <Tabs.List>
                        <Tabs.Tab value="all"
                            leftSection={<ShoppingCart style={iconStyle} />}
                        >
                            Orders
                        </Tabs.Tab>
                        <Tabs.Tab value="pending-deliveries"
                            leftSection={<XCircle style={iconStyle} />}
                        >
                            Pending Deliveries
                        </Tabs.Tab>
                        <Tabs.Tab value="successfull-deliveries"
                            leftSection={<ListChecks style={iconStyle} />}
                        >
                            Successfull Deliveries
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="all" mt={20}>
                        {user?.role === user_role.vendor && <AllOrders />}
                        {user?.role === user_role.admin ||
                            user?.role === user_role.company && <CompanyOrders />}
                    </Tabs.Panel>

                    <Tabs.Panel value="pending-deliveries" mt={20}>
                        {user?.role === user_role.vendor && <OrderPendingDeliveries />}
                    </Tabs.Panel>

                    <Tabs.Panel value="successfull-deliveries" mt={20}>
                        {user?.role === user_role.vendor && <OrderSuccessfullDeliveries />}
                    </Tabs.Panel>
                </Tabs>
            </Card>
        </Flex>
    );
}

export default Orders;