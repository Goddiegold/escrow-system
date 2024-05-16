import { NavbarSimpleColored } from '@/components/shared/sidebar';
import { AppShell, Flex,Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import DashboardHeader from '../shared/DashboardHeader';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
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

    return (
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
            <AppShell.Main>
                {/* <Flex direction={"column"} className='p-[10px] lg:p-[30px]'> */}
                    {/* <Text>Hi there 👋, welcome 😁</Text> */}
                    <Outlet />
                {/* </Flex> */}
            </AppShell.Main>
        </AppShell>
    );
}