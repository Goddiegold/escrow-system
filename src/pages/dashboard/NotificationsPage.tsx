import { useUserContext } from "@/context/UserContext";
import { useClient } from "@/shared/client";
import { convertAmount, getInitials, toast } from "@/shared/helpers";
import { notification_type, NotificationType, User } from "@/shared/types";
import { ActionIcon, Avatar, Button, Center, Flex, Paper, Skeleton, Space, Spoiler, Text, Tooltip } from "@mantine/core";
import { ArrowsClockwise, Check } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";

interface NotificationItemProps {
    customer: User | null,
    createdAt: Date | null,
    message: string | null,
}

const NotificationItem: React.FC<NotificationItemProps> = ({ ...props }) => {
    const { createdAt, customer, message } = props;
    return (
        <Paper shadow="sm"
            maw={500} mb={10} p={"md"}>
            <Flex className="flex-1" justify={"space-between"}
                wrap={"wrap"} direction={"row"}>
                <Flex direction={"row"}>
                    <Flex>
                        <Avatar w={50} h={50}>{customer ? getInitials(customer.name) : "EA"}</Avatar>
                    </Flex>
                    <Space mx="xs" />
                    <Flex direction={"column"}>
                        <Spoiler maxHeight={50} showLabel="Show more" hideLabel="Hide">
                            <Text>{message}</Text>
                            <Text c={"dimmed"} fz="xs">{moment(createdAt || new Date()).fromNow()}</Text>
                        </Spoiler>
                    </Flex>
                </Flex>

                <Tooltip label="Mark as read">
                    <ActionIcon variant="transparent" color="green">
                        <Check size={20} /></ActionIcon>
                </Tooltip>
            </Flex>
        </Paper>
    )
}

const NotificationsPage = () => {
    const { user } = useUserContext()
    const clientInstance = useClient()

    const { data, isLoading, refetch: refetchNotifications, isRefetching } = useQuery({
        queryKey: ["notifications", user?.id],
        queryFn: async () => {
            try {
                const response = await clientInstance().get("/users/notifications")
                return response.data?.result as NotificationType[]
            } catch (error) {
                toast(error?.response?.data?.message).error()
            }
        },
        refetchOnMount: "always",
        refetchInterval: 1200000,
    })

    const isFetching = isLoading || isRefetching;

    const renderNotificationItems = (items: NotificationType[]) => {
        return items.map((item) => {
            const { type: notificationType, order, createdAt } = item;
            const customer = order?.customer;
            const orderRef = order?.orderRef
            let message = "";

            switch (notificationType) {
                case notification_type.customer_placed_order:
                    message = `${customer?.name || 'A customer'} just placed an order on your store. Order reference: ${orderRef}`;
                    break;
                case notification_type.delivery_confirmed:
                    message = `${customer?.name || 'A customer'} just confirmed that order ${orderRef} ${order?.userReceived ? "has been received successfully" : "has been received"}.${order?.userReceived && ` You've been credited with ₦${convertAmount(order.totalAmount)}`}`;
                    break;
                default:
                    message = "You have a new notification.";
                    break;
            }

            return (
                <NotificationItem
                    createdAt={createdAt}
                    customer={customer}
                    message={message}
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
                        <Text>No notifications found</Text>
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