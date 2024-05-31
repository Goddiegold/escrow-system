import useNavigation from "@/hooks/useNavigation";
import { Button } from "@mantine/core";
import { ArrowLeft } from "@phosphor-icons/react";
import { useLocation } from "react-router-dom";

const BackBtn = () => {
    const navigate = useNavigation()
    const { state } = useLocation()
    return (
        <Button
            m={0}
            p={0}
            color="dark"
            variant="transparent"
            onClick={() => navigate(state?.prevPath ?? "/dashboard")}
            leftSection={<ArrowLeft size={20} />}>
            Back
        </Button>
    );
}

export default BackBtn;