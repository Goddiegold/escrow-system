import Logo from "@/components/shared/Logo";
import client from "@/shared/client";
import { toast } from "@/shared/helpers";
import { Order } from "@/shared/types";
import { Button, Flex, LoadingOverlay, Popover, Rating, Space, Text, Textarea } from "@mantine/core";
import { CheckCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ConfirmDelivery = () => {
  const { orderId } = useParams()
  const [rating, setRating] = useState({
    value: null,
    review: ""
  })
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading1(true)
    client().get(`/orders/${orderId}`)
      .then(res => {
        setCurrentOrder(res?.data?.result)
        setLoading1(false)
      }).catch(err => {
        setLoading1(false)
        toast(err?.response?.data.message).error()
        navigate("*")
      })
  }, [orderId])


  const handleConfimation = (receivedOrder: boolean) => {
    setLoading2(true)
    client().post(`/orders/confirm-delivery/${orderId}`, { rating, receivedOrder })
      .then(res => {
        toast(res.data?.message).success()
        setLoading2(false)
        if (receivedOrder && currentOrder) {
          setCurrentOrder({ ...currentOrder, userReceived: true })
        }
      }).catch(err => {
        setLoading2(false)
        toast(err?.response?.data?.message).error()
      })

  }

  return (
    <Flex direction={"column"} h={"100vh"}>
      <Flex direction={"column"} mx={"auto"}
        my={"auto"}>
        <Flex
          align={'center'}
          maw={600}
          direction={'column'}
          className="border shadow-sm rounded-3xl"
          p={20}>
          {loading1 ? <LoadingOverlay zIndex={1000}
            visible
            overlayProps={{ radius: "sm", blur: 2 }} /> :
            <>
              <Logo />
              {currentOrder
                && !currentOrder?.userReceived ? <Flex my={20} direction={'column'} w={"95%"}>
                <Text fw={500} size={"xl"} ta={"center"} mb={10}>Hi there 👋</Text>
                <Text fw={400}
                >
                  Please confirm if your order {currentOrder.orderRef} with
                  {currentOrder?.company?.name} has been delivered by {currentOrder?.vendor?.name}.</Text>
                <Flex my={10} direction={"column"}>
                  <Rating
                    fractions={4}
                    value={rating.value}
                    size="xl" my={10}
                    onChange={value => setRating({ ...rating, value })} />
                  <Textarea
                    className="w-full"
                    minRows={5} maxRows={7}
                    my={10}
                    value={rating.review}
                    onChange={({ target }) =>
                      setRating({
                        ...rating,
                        review: target.value
                      })} />
                </Flex>

                <Flex className="flex flex-col sm:flex-row" my={10} justify={"space-between"}>
                  <Button color="dark" fw={400} className="mb-[10px] sm:mb-0">No (I haven't received the order)</Button>
                  <Popover width={200} position="bottom" withArrow shadow="md">
                    <Popover.Target>
                      <Button color="red" fw={400}>Yes (I have received the order)</Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text size="sm">Are you sure you've received the delivery?</Text>
                      <Flex justify={"space-between"} my={5}>
                        <Button color="black" size="xs"
                          loading={loading2}
                          onClick={() => handleConfimation(false)}>No</Button>
                        <Button color="red" size="xs"
                          loading={loading2}
                          onClick={() => handleConfimation(true)}>Yes</Button>
                      </Flex>
                    </Popover.Dropdown>
                  </Popover>
                </Flex>
              </Flex> :
                <Flex my={20} direction={'column'}>
                  <Text fw={500} size={"xl"} ta={"center"} mb={10}>Hi there 👋</Text>
                  <Flex direction={"column"} my={20}>
                    <CheckCircle size={100} color="#228be6" className="mx-auto" />
                    <Text my={10}>This Order has been confirmed successfully, if you didn't confirm it contact support.</Text>
                    <Flex justify={"flex-start"}>
                      <Button
                        variant="transparent"
                        p={0} mx={0}>
                        support@escrowsystem.com
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>}
            </>
          }

        </Flex>

        {!loading1 && <Flex
          mx={"auto"}
          maw={500} my={10} p={20}>
          <Text fw={300} size="sm">24/7 support via support@escrowsystem.com or +234 705 215 2823</Text>
        </Flex>}
      </Flex>
    </Flex>
  );
}

export default ConfirmDelivery;