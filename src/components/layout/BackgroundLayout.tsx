import { Flex, Text, BackgroundImage, Paper, Group, Center } from '@mantine/core';
import { ReactNode } from 'react';
import handshakePic from "@/assets/handshake.jpg"
import Logo from '../shared/Logo';

interface BackgroundLayoutProps {
    title?: string,
    children: ReactNode,
    bottomContent?: ReactNode
}

// "https://source.unsplash.com/1024x768/?nature",
// "https://source.unsplash.com/1024x768/?water",
// "https://source.unsplash.com/1024x768/?girl",
// "https://source.unsplash.com/1024x768/?tree",
function BackgroundLayout({ title, children, bottomContent }: BackgroundLayoutProps) {
    return (
        <Flex
            mih={"100vh"}
            className='flex flex-row justify-center items-center'>
            <Flex className={`w-[50%] hidden md:flex min-h-full`} style={{ height: window.innerHeight }}>
                <BackgroundImage
                    src={handshakePic}
                >   </BackgroundImage>
            </Flex>
            <Flex className="flex flex-col w-full md:w-[50%] h-full my-auto">
                <Flex className="flex-col items-center h-full "
                    maw={400}
                    mx={"auto"}>
                    <Paper
                        withBorder
                        p={30}
                        radius={"sm"}
                        w={"100%"}
                        mx={10}>
                        <Center my={20}>
                            <Logo />
                        </Center>
                        <Text className="text-center" size="lg" fw={600}>{title}</Text>
                        {children}
                    </Paper>
                    {bottomContent &&
                        <Paper withBorder
                            p={10} mt={10} radius="sm"
                            w={"100%"}
                        >
                            <Group justify="center" m={10}>
                                {bottomContent}
                            </Group>
                        </Paper>}
                </Flex>
            </Flex>

        </Flex>
    );
}

export default BackgroundLayout;