import { Button, Flex, TextInput, Textarea } from "@mantine/core";
import { At, User as UserIcon, MapPinSimpleArea } from "@phosphor-icons/react"

const ProfileSettings = () => {
    return (
        <Flex direction={"column"} maw={500}>
            <form>
                <TextInput
                    leftSection={<UserIcon size={20} />}
                    label="Name" my={10} />
                <TextInput
                    leftSection={<At size={20} />}
                    label="Email" my={10} />
                <Textarea
                    leftSection={<MapPinSimpleArea size={20} />}
                    my={10}
                    label="Address"
                // placeholder="Input placeholder"
                />
                <Button my={10}>Update</Button>
            </form>
        </Flex>
    );
}

export default ProfileSettings;