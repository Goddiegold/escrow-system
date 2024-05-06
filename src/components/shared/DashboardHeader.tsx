import { Burger, Group } from "@mantine/core";
import { MantineLogo } from "@mantinex/mantine-logo";

interface DashboardHeaderProps {
    mobileOpened: boolean,
    desktopOpened: boolean,
    toggleMobile: () => void,
    toggleDesktop: () => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> =
    ({ mobileOpened, desktopOpened, toggleMobile, toggleDesktop }) => {
        return (
            <>
                <Group h="100%" px="md">
                    <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
                    <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
                    <MantineLogo size={30} />
                </Group></>
        );
    }

export default DashboardHeader;