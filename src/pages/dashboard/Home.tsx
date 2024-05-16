import AppCard from '@/components/shared/AppCard';
import { Grid, Skeleton, Container, Flex, Text } from '@mantine/core';
import { Newspaper } from '@phosphor-icons/react';


export function DashboardHome() {
    return (
        <Flex direction={"column"} p={10}>
            <Text my={10} fw={600} size='lg'>Hi there 👋, welcome 😁</Text>
            <Grid>
                {Array(5).fill(null).map(item => (
                    <Grid.Col span={{ base: 12, xs: 12, md: 6, lg: 4 }}>
                        <AppCard
                            totalNumber={20}
                            title={"Published Papers"}
                            action={"view papers"}
                            actionPath={"/dashboard/papers"}
                            icon={<Newspaper size={20} color="gray" />}
                        />
                    </Grid.Col>
                ))}
            </Grid>
        </Flex>
    );
}