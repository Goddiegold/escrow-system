import BackgroundLayout from "@/components/layout/BackgroundLayout";
import { PinInput, Flex, Button, Text} from "@mantine/core";
import { useEffect, useState } from "react";

const VerifyOtp = () => {
    const [minutes, setMinutes] = useState(1)
    const [seconds, setSeconds] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1)
            }

            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(interval)
                } else {
                    setSeconds(59)
                    setMinutes(minutes - 1)
                }
            }
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [seconds, minutes])
    return (
        <BackgroundLayout title=" Enter the OTP sent to your email address">
            <Flex
                mt={15}
                direction="column"
                align="center"
                style={{
                    fontFamily: `Open Sans, sans-serif`,
                    color: "white",
                }}
            >
                <PinInput
                    my={2}
                    size="lg"
                    placeholder="o"
                    type="number"
                    oneTimeCode
                // onComplete={handleSubmit}
                />
            </Flex>
            <Flex
                className="flex-col items-center justify-center mt-5"
            >
                {seconds > 0 || minutes > 0 ? (
                    <Text>
                        Time Remaining: {minutes < 10 ? `0${minutes}` : minutes}:
                        {seconds < 10 ? `0${seconds}` : seconds}
                    </Text>
                ) : (
                    <Text >I didn't receive the code</Text>
                )}

                <Button
                my={10}
                    // loading={loading}
                    variant="white"
                    // onClick={handleOtpResend}
                    disabled={seconds > 0 || minutes > 0}
                    style={
                        {
                            color: seconds > 0 || minutes > 0 ? '#DFE3E8' : '#83D3C4',
                            paddingLeft: 10,
                        }}
                >
                    RESEND OTP
                </Button>
            </Flex>
        </BackgroundLayout>
    );
}

export default VerifyOtp;