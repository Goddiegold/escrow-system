import ProfileSettings from "@/shared/dashboard/settings/ProfileSettings";
import Security from "@/shared/dashboard/settings/Security";
import { Card, Tabs } from "@mantine/core";
import { LockKey, UserCircle } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";

const Settings = () => {
    const navigate = useNavigate();
    const { tabValue } = useParams();
    return (
        <Card
            shadow="sm">
            <Tabs
                defaultValue="profile"
                value={tabValue}
                onChange={value => navigate(`/dashboard/settings/${value}`)}>
                <Tabs.List >
                    <Tabs.Tab
                        leftSection={<UserCircle size={20} />}
                        value="profile">Profile</Tabs.Tab>
                    <Tabs.Tab
                        leftSection={<LockKey size={20} />}
                        value="security">Security</Tabs.Tab>
                    <Tabs.Tab value="subscripitons">Subscripiton</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="profile" pt="xs">
                    {/* <ProfileInformation /> */}
                    <ProfileSettings />
                </Tabs.Panel>

                <Tabs.Panel value="security" pt="xs">
                    <Security/>
                </Tabs.Panel>

                <Tabs.Panel value="subscripitons" pt="xs">
                    {/* <SubscriptionManagement /> */}
                </Tabs.Panel>

                <Tabs.Panel value="sub_and_acct_mgt" pt="xs">
                    {/* <SubAndAcctMgt /> */}
                </Tabs.Panel>

                <Tabs.Panel value="transactions" pt="xs">
                    {/* <TransactionHistory userId={user?.id} /> */}
                </Tabs.Panel>
            </Tabs>
        </Card>
    );
}

export default Settings;