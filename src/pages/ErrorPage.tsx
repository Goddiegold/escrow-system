import { Button, Center, Flex } from "@mantine/core";
import { useNavigate, useRouteError } from "react-router-dom";
// import styles from "../../styles/component/utility/ErrorPage.module.css";

export default function ErrorPage() {
  const error = useRouteError() as object & {
    statusText: string;
    message: string;
  };
  console.error(error);

  const navigate = useNavigate();

  return (
    <Center w={"100vw"} h={"100vh"}>
      <Flex className="flex flex-col justify-center items-center">
        {error?.statusText && <h1 className="!font-primary">{error.statusText}</h1>}
        {error.message && <p className="!font-primary">{error.message}</p>}
        <Button
          fullWidth
          className="mt-2 bg-primary hover:bg-primary w-full"
          size="md"
          radius={"md"}
          // className={styles.button}
          onClick={() => {
            navigate("/login");
          }}
          variant="filled"
        >
          Back to Login
        </Button>
      </Flex>
    </Center>
  );
}
