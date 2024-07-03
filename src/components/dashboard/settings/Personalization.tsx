import { Button, Flex, SegmentedControl, Text } from "@mantine/core";

const Personalization = () => {
    return (
        <Flex mt={20} direction={"column"} maw={500}>
            <Flex direction={"column"} mb={10}>
                <Text fw={400}>Allow escrow handle email notifications to your customers?</Text>
                <SegmentedControl
                    maw={300}
                    data={['Yes', 'No']} />
            </Flex>

            <Flex direction={"column"} mb={10}>
                <Text>Receive notifications of activities between customers and vendors?</Text>
                <SegmentedControl
                    maw={300}
                    data={['Yes', 'No']} />
            </Flex>

            <Button
                w={100}
                my={10}
            >Update</Button>
        </Flex>
    );
}

export default Personalization;