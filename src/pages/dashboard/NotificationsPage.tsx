import { useUserContext } from "@/context/UserContext";
import useNavigation from "@/hooks/useNavigation";
import client, { useClient } from "@/shared/client";
import { convertAmount, getInitials, toast } from "@/shared/helpers";
import { notification_type, NotificationType, User, user_role } from "@/shared/types";
import {
    ActionIcon, Avatar, Button, Center, Flex, Paper,
    Skeleton, Space, Spoiler, Text, Tooltip
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { ArrowsClockwise, Check } from "@phosphor-icons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
    item: NotificationType,
    message: string | null,
    customer: User | null,
    path: string | null,
}

const NotificationItem: React.FC<NotificationItemProps> = ({ ...props }) => {
    const { createdAt, id: notificationId } = props.item;
    const { user } = useUserContext()
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState(false)
    const { width } = useViewportSize()
    const navigate = useNavigation()

    // const proceedBtnVisible = 

    const handleMarkAsRead = async () => {
        try {
            setLoading(true)
            const res = await client().put(`/users/notifications/${notificationId}`)
            queryClient.setQueryData(["notifications", user?.id], (data: NotificationType[] | null) => {
                if (!data) return;
                return data.filter(item => item.id !== notificationId)
            })
            setLoading(false)
            toast(res?.data?.message).success()
        } catch (error) {
            toast(error?.response?.data?.message).error()
        }
    }

    const biggerScreen = width >= 768

    return (
        <Paper shadow="sm"
            radius={"md"}
            maw={500} mb={10} p={"sm"}>
            <Flex className="flex-1"
                justify={"space-between"}
                wrap={biggerScreen ? "nowrap" : "wrap"}
                direction={"row"}>
                <Flex direction={"row"}>
                    <Flex>
                        <Avatar w={50} h={50}>{props?.customer ? getInitials(props.customer.name) : "EA"}</Avatar>
                    </Flex>
                    <Space mx="xs" />
                    <Flex direction={"column"}>
                        <Spoiler maxHeight={50} showLabel="Show more" hideLabel="Hide" classNames={{
                            control: "!text-xs"
                        }}>
                            <Text fw={300}>{props.message}</Text>
                            <Text c={"dimmed"} fz="xs">{moment(createdAt || new Date()).fromNow()}</Text>
                        </Spoiler>
                    </Flex>
                </Flex>


                <Flex
                    w={!biggerScreen ? "100%" : "15%"}
                    justify={width >= 768 ? "flex-end" : "space-between"}
                    align={"flex-end"}
                    direction={biggerScreen ? "column" : "row-reverse"}>
                    <Tooltip label="Mark as read">
                        <ActionIcon variant="transparent"
                            color="green" onClick={handleMarkAsRead}
                            loading={loading}>
                            <Check size={20} /></ActionIcon>
                    </Tooltip>
                    <Button variant="transparent" p={0} size="xs" onClick={() => navigate(props!.path)}>Proceed</Button>
                </Flex>
            </Flex>
        </Paper >
    )
}

const NotificationsPage = () => {
    const { user } = useUserContext()
    const clientInstance = useClient()
    const queryKey = ["notifications", user?.id]
    const isAdmin = user?.role === user_role.admin

    const { data, isLoading, refetch: refetchNotifications, isRefetching } = useQuery({
        queryKey,
        queryFn: async () => {
            try {
                const response = await clientInstance().get("/users/notifications")
                return response.data?.result as NotificationType[]
            } catch (error) {
                toast(error?.response?.data?.message).error()
            }
        },
        // refetchOnMount: "always",
        refetchInterval: 1200000,
        enabled: !isAdmin,
    })

    const isFetching = isLoading || isRefetching;

    const isVendor = user?.role === user_role.vendor;


    const renderNotificationItems = (items: NotificationType[]) => {
        return items.map((item) => {
            const { type: notificationType, order } = item;
            const customer = order?.customer;
            const orderRef = order?.orderRef
            let message = "";
            let path = "#";

            switch (notificationType) {
                case notification_type.customer_placed_order:
                    message = `${customer?.name || 'A customer'} just placed an order ${isVendor ? "on your store" : `with ${item.vendor?.name}`}. Order Ref: ${orderRef}`
                        ;
                    path = isVendor ? "/dashboard/orders" : `/dashboard/vendor-orders/${item!.vendor!.id}`
                    break;

                case notification_type.delivery_confirmed:
                    message = `${customer?.name || 'A customer'} just confirmed that order ${orderRef} ${!isVendor ? `with ${item.vendor?.name}`:""} ${order?.userReceived ? "has been received successfully" : "hasn't been received"}. ${isVendor && order?.userReceived && ` You've been credited with ₦${convertAmount(order!.totalAmount as number)}`}`

                    path = isVendor ? (order?.userReceived ? "/dashboard/wallet/" : "/dashboard/orders") :
                        `/dashboard/vendor-orders/${item!.vendor!.id}`;
                    break;

                case notification_type.order_delivered:
                    message = !isVendor ? `Order ${orderRef} with ${item?.vendor?.name} for ${customer?.name} have been updated to delivered` : `You've updated order ${orderRef} for ${customer?.name} to delivered`;
                    path = isVendor ? "/dashboard/orders" : `/dashboard/vendor-orders/${item!.vendor!.id}`;
                    break;

                case notification_type.order_cancelled:
                    message = !isVendor ? `Order ${orderRef} with ${item?.vendor?.name} for ${customer?.name} have been cancelled` : `You've cancelled order ${orderRef} for ${customer?.name}`;
                    path = isVendor ? "/dashboard/orders" : `/dashboard/vendor-orders/${item!.vendor!.id}`;
                    break;
                default:
                    message = "You have a new notification.";
                    break;
            }

            return (
                <NotificationItem
                    message={message}
                    item={item}
                    path={path}
                    customer={customer!}
                    key={item.id}
                />
            );
        });
    };


    return (
        <Flex mih={"100vh"} direction={"column"}>
            <Flex direction={'row'} justify={'space-between'} my={10} wrap={"wrap"}>
                <Text fw={700} c={"dark"}>Notifications</Text>
                {!isLoading && <Button
                    onClick={() => refetchNotifications()}
                    loading={isRefetching}
                    leftSection={<ArrowsClockwise size={20} />}
                >
                    Refetch
                </Button>}
            </Flex>

            {!isFetching ? <>
                {data && data?.length > 0 ?
                    <>
                        {renderNotificationItems(data)}
                    </> : <Center>
                        <Text c={"dark"}>No notifications found</Text>
                    </Center>
                }
            </> : <Flex direction={"column"}>
                {Array(5).fill(null).map((_, key) => (
                    <Skeleton maw={500} key={key} h={80} my={10} />
                ))}
            </Flex>}

        </Flex>
    );
}

export default NotificationsPage;