import ProfileSettings from "@/components/dashboard/settings/ProfileSettings";
import Security from "@/components/dashboard/settings/Security";
import BackBtn from "@/components/shared/BackBtn";
import { useUserContext } from "@/context/UserContext";
import { user_role } from "@/shared/types";
import { Card, Flex, Tabs } from "@mantine/core";
import { LockKey, UserCircle } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";

const Settings = () => {
    const navigate = useNavigate();
    const { tabValue } = useParams();
    const { user } = useUserContext()
    const isAdmin = user?.role === user_role.admin
    return (
        <>
            <Flex justify={"flex-start"} my={10}>
                <BackBtn />
            </Flex>
            <Card
                shadow="sm">
                <Tabs
                    defaultValue={!isAdmin?"profile":"security"}
                    value={tabValue}
                    onChange={value => navigate(`/dashboard/settings/${value}`)}>
                    <Tabs.List >
                        {!isAdmin && <Tabs.Tab
                            leftSection={<UserCircle size={20} />}
                            value="profile">Profile</Tabs.Tab>}
                        <Tabs.Tab
                            leftSection={<LockKey size={20} />}
                            value="security">Security</Tabs.Tab>
                        {/* {isCompany && <Tabs.Tab
                            value="personalization"
                            leftSection={<PaintBrush size={20} />}>
                            Personalization
                        </Tabs.Tab>} */}
                    </Tabs.List>

                    {!isAdmin && <Tabs.Panel value="profile" pt="xs">
                        <ProfileSettings />
                    </Tabs.Panel>}

                    <Tabs.Panel value="security" pt="xs">
                        <Security />
                    </Tabs.Panel>
                    {/* {isCompany && <Tabs.Panel value="personalization" pt="xs">
                        <Personalization />
                    </Tabs.Panel>} */}
                </Tabs>
            </Card>
        </>
    );
}

export default Settings;