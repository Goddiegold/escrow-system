import { Button, Flex, TextInput, Textarea } from "@mantine/core";
import { DateInput } from '@mantine/dates';
import { At, User as UserIcon, Lock, MapPinSimpleArea, Calendar } from "@phosphor-icons/react"

const ProfileSettings = () => {
    return (
        <Flex direction={"column"}>
            <form className="w-[80%] sm:w-[500px]">
                <TextInput
                    leftSection={<UserIcon size={20} />}
                    label="Name" my={10} />
                <TextInput
                    leftSection={<At size={20} />}
                    label="Email" my={10} />
                <DateInput
                    my={10}
                    label="Date Of Birth"
                    placeholder="Date input"
                    leftSection={<Calendar size={20} />}
                />
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