import {
    ActionIcon, Avatar, Burger, Button, Flex, Group, Menu,
    Text, Tooltip, useMantineColorScheme
} from "@mantine/core";
import Logo from "./Logo";
import { Bell, CaretRight, Moon, Sun } from "@phosphor-icons/react";
import { getInitials, menuData } from "@/shared/helpers";
import { IoMdLogOut } from "react-icons/io";
import { useUserContext } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
    mobileOpened: boolean,
    toggleMobile: () => void,
}


const DashboardHeader: React.FC<DashboardHeaderProps> =
    ({ mobileOpened, toggleMobile }) => {
        const { colorScheme, toggleColorScheme } = useMantineColorScheme();
        const dark = colorScheme === 'dark';
        const navigate = useNavigate()

        const MenuOptions = () => {
            return (<>
                {menuData?.map(item => (
                    <Menu.Item
                        my={10}
                        leftSection={<item.icon size={20} />}>{item.label}</Menu.Item>
                ))}
            </>)
        }
        const { user } = useUserContext()

        return (
            <Group h="100%" px="md" justify="space-between">
                <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
                <Logo />
                <Flex align={'center'}>
                    <Flex className="hidden md:block">
                        <Tooltip label={dark ? "Light mode" : "Dark mode"}>
                            <ActionIcon
                                size={'lg'}
                                radius={10}
                                mx={5}
                                variant="outline"
                                color='gray'
                                onClick={() => toggleColorScheme()}
                                title="Toggle color scheme"
                            >
                                {dark ? <Sun size={25} color='gray' /> : <Moon size={25} color='gray' />}
                            </ActionIcon>
                        </Tooltip>

                        <ActionIcon
                            onClick={() => navigate("/dashboard/notifications")}
                            size={'lg'}
                            radius={10}
                            mx={5}
                            variant="transparent"
                            // variant="outline"
                            color='gray'
                            title="Toggle color scheme"
                        >
                            <Bell size={25} />
                        </ActionIcon>
                    </Flex>

                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <Button
                                maw={300}
                                mih={60}
                                p={0}
                                className="-mr-[20px] md:mr-0"
                                variant="transparent"
                                rightSection={<CaretRight size={20} color='gray' className='hidden md:block' />}>
                                <Flex direction={'row'} align={'center'} className='w-full'>
                                    <Avatar
                                        mx={10}
                                        radius={50}
                                        w={50}
                                        h={50}
                                        src={""}
                                    >{getInitials(user?.name)}</Avatar>
                                    <Flex direction={'column'} className='hidden md:flex max-w-[80%]' align={'flex-start'}>
                                        <Text fw={700} c='dark'>{user?.name}</Text>
                                        <Text size={'xs'} c={'gray'} className="!break-all text-wrap items-start text-start">{user?.email}</Text>
                                    </Flex>
                                </Flex>
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>Application</Menu.Label>
                            <MenuOptions />
                            <Menu.Divider />
                            <Menu.Label>Other</Menu.Label>
                            <Flex className="block md:hidden">
                                <Tooltip label={dark ? "Light mode" : "Dark mode"}>
                                    <Menu.Item
                                        onClick={() => toggleColorScheme()}
                                        my={10}
                                        leftSection={
                                            dark ? <Sun size={20} /> : <Moon size={20} />
                                        }>{dark ? "Light mode" : "Dark mode"}</Menu.Item>
                                </Tooltip>
                            </Flex>
                            <Menu.Item
                                my={10}
                                leftSection={<IoMdLogOut stroke={`1.5`} size={20} />}>Logout</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Flex>
                {/* <p>{article.body.slice(0, 20)}...</p> */}
            </Group>
        );
    }

export default DashboardHeader;