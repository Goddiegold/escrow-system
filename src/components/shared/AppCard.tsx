import { Card, Flex, Text } from "@mantine/core";
import { Newspaper } from "@phosphor-icons/react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";


interface AppCardProps {
    title: string,
    action: string,
    actionPath: string,
    totalNumber: number | string,
    icon?: ReactNode
}

const AppCard: React.FC<AppCardProps> = ({ ...props }) => {
    const { title, action, totalNumber, actionPath, icon } = props
    return (
        <Card
            mih={150}
            withBorder
            shadow="md"
            className={`rounded-xl bg-white py-6 px-7  
            font-3 flex flex-col justify-between`}>
            <Flex className="flex flex-row justify-between">
                <Text size={'md'} className="" fw={600}>{title}</Text>
                {icon}
            </Flex>
            <Text fw={600} size={"24px"} my={5}>{totalNumber}</Text>
            {/* <Link to={actionPath}
                state={{ prevPath: window.location.pathname }}
                className="cursor-pointer underline text-gray-300 text-xs text-muted-foreground">{action}</Link> */}
            <Link to={actionPath} state={{ prevPath: window.location.pathname }} className="cursor-pointer underline text-gray-400 font-normal">{action}</Link>
        </Card>
    );
}

export default AppCard;