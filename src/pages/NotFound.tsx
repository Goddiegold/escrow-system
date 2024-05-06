import {
    Title,
    Button,
    Container,
    Group,
    rem,
    Text,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <Container
            py={rem(80)}>
            <Text
                className={"text-center font-black leading-[1] mb-[20px] text-[15rem]"} >404</Text>
            <Title className={"text-center font-black"}>Page not found</Title>
            <Group justify="center">

                <Button
                    size="md"
                    className="bg-color-1 hover:bg-color-1"
                    type="button"
                    radius={"md"}
                    mt={30}
                    onClick={() => navigate("/")}
                >
                    Go back
                </Button>
            </Group>
        </Container>
    );
}
