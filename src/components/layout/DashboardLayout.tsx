import { NavbarSimpleColored } from '@/components/shared/sidebar';
import { AppShell, Button, CopyButton, Flex, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import DashboardHeader from '../shared/DashboardHeader';
import { Outlet, useLocation } from 'react-router-dom';
import AuthWrapper from '../shared/AuthWrapper';
import RegisterCompanyModal from '../shared/RegisterCompanyModal';
import { useUserContext } from '@/context/UserContext';
import { user_role } from '@/shared/types';

export default function DashboardLayout() {
    const location = useLocation()
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

    const [isMobile, setIsMobile] = useState(false);

    // Function to check if the screen size is mobile
    const checkMobile = () => {
        const isMobileDevice = window.innerWidth <= 768; // You can adjust this threshold according to your design
        setIsMobile(isMobileDevice);
    };

    // useEffect hook to run the checkMobile function when the component mounts and when the window is resized
    useEffect(() => {
        checkMobile(); // Check initially
        window.addEventListener('resize', checkMobile); // Check on window resize
        return () => {
            window.removeEventListener('resize', checkMobile); // Clean up on unmount
        };
    }, []);

    const { isLoggedIn, user } = useUserContext()
    return (
        <AuthWrapper>
            <AppShell
                header={{ height: 90 }}
                navbar={{
                    width: 300,
                    breakpoint: 'sm',
                    collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
                }}
                padding="md"
            >
                <AppShell.Header >
                    <DashboardHeader
                        // toggleDesktop={toggleDesktop}
                        toggleMobile={toggleMobile}
                        mobileOpened={mobileOpened}
                    // desktopOpened={desktopOpened}
                    />
                </AppShell.Header>

                <AppShell.Navbar >
                    <NavbarSimpleColored />
                </AppShell.Navbar>
                <AppShell.Main bg={"rgb(248, 249, 250)"}>
                    <Flex direction={"column"} p={10}>
                    {location.pathname === "/dashboard" && <Flex direction={"row"} justify={"space-between"}>
                             <Text my={10} fw={600} size='lg'>Hi there {user?.name} 👋, welcome 😁</Text>
                            {isLoggedIn && user?.role === user_role.company ?
                                <CopyButton value={`${window.origin}/register/${user?.company?.slug}`}>
                                    {({ copied, copy }) => (
                                        <Tooltip label="Unique registration link For your vendors" withArrow>
                                            <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
                                                {copied ? 'Copied url' : 'Copy Url'}
                                            </Button>
                                        </Tooltip>
                                    )}
                                </CopyButton>
                                : null}
                        </Flex>} 
                        <Outlet />
                        {isLoggedIn && user?.id && user?.role === user_role.company && !user?.company ? <RegisterCompanyModal /> : null}
                    </Flex>
                </AppShell.Main>
            </AppShell>
        </AuthWrapper>
    );
}