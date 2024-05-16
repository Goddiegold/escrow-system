import { Flex, Text, BackgroundImage, Paper, Container, Group, Center } from '@mantine/core';
import { ReactNode } from 'react';
import handshakePic from "@/assets/handshake.jpg"
import { Link } from 'react-router-dom';
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
                <Flex className="flex-col w-full items-center h-full " >
                    <Paper
                        // my={'auto'}
                        withBorder
                        p={30}
                        radius={"sm"}
                        className='w-[90%] sm:w-[350px]' mx={10}>
                        {/* <div className="flex items-center justify-center mb-[20px]">
                        </div> */}
                        <Center my={20}>
                            <Logo />
                        </Center>
                        <Text className="text-center" size="lg" fw={600}>{title}</Text>
                        {children}
                    </Paper>
                    {bottomContent && <Paper withBorder p={10} mt={10} radius="sm" className='w-[90%] sm:w-[350px]'>
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