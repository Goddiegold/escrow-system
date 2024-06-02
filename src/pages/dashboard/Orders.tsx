import BackBtn from "@/components/shared/BackBtn";
import AllOrders from "@/components/shared/dashboard/orders/AllOrders";
import OrderPendingDeliveries from "@/components/shared/dashboard/orders/OrderPendingDeliveries";
import OrderSuccessfullDeliveries from "@/components/shared/dashboard/orders/OrderSuccessfullDeliveries";


import { Card, Flex, ScrollArea, Tabs, rem } from "@mantine/core";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ListChecks, ShoppingCart, XCircle } from "@phosphor-icons/react";


const useQueryURL = () => {
    const { search } = useLocation()
    return new URLSearchParams(search);
};


const Orders = () => {
    const navigate = useNavigate();
    const { tabValue } = useParams();
    const iconStyle = { width: rem(15), height: rem(15) };
    const queryURL = useQueryURL();

    const vendorId = queryURL.get("vendorId")

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
                        <AllOrders />
                    </Tabs.Panel>

                    <Tabs.Panel value="pending-deliveries" mt={20}>
                        <OrderPendingDeliveries />
                    </Tabs.Panel>

                    <Tabs.Panel value="successfull-deliveries" mt={20}>
                        <OrderSuccessfullDeliveries />
                    </Tabs.Panel>
                </Tabs>
            </Card>
        </Flex>
    );
}

export default Orders;