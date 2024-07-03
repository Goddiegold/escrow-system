import { Button, Flex, PasswordInput } from "@mantine/core";
import { LockSimple } from "@phosphor-icons/react";

const SecuritySettings = () => {
    return (
        <Flex direction={"column"} maw={500}>
            <form >
                <PasswordInput
                    leftSection={<LockSimple size={20} />}
                    my={10}
                    label="Current Password"
                    // description="Input description"
                    placeholder="Your Current Password"
                />
                <PasswordInput
                    leftSection={<LockSimple size={20} />}
                    my={10}
                    label="New Password"
                    // description="Input description"
                    placeholder="Your Current Password"
                />
                <PasswordInput
                    leftSection={<LockSimple size={20} />}
                    my={10}
                    label="Confirm Password"
                    // description="Input description"
                    placeholder="Your Current Password"
                />
                <Button my={10}>Update</Button>
            </form>
        </Flex>
    );
}

export default SecuritySettings;