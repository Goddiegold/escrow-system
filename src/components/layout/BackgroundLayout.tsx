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
            className='flex flex-row'>

            <Flex className={`w-[50%] hidden lg:flex`} mih={"100vh"}>
                <BackgroundImage
                    src={handshakePic}
                >   </BackgroundImage>
            </Flex>
            <Flex className="flex flex-col w-full lg:w-[50%] h-full my-auto">
                <Flex className="flex-col w-full items-center h-full font-primary">
                    <Paper
                        maw={400}
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
                            w={"100%"}
                            p={10} mt={10} radius="sm"
                            maw={400}
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