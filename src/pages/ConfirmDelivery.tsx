import Logo from "@/components/shared/Logo";
import client from "@/shared/client";
import { toast } from "@/shared/helpers";
import { Order } from "@/shared/types";
import { Button, Flex, Popover, Rating, Skeleton, Space, Text, Textarea } from "@mantine/core";
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


  const handleConfimation = () => {
    setLoading2(true)
    client().post(`/orders/confirm-delivery/${orderId}`, { ...rating })
      .then(res => {
        toast(res.data?.message).success()
        setLoading2(false)
        navigate("/")
      }).catch(err => {
        setLoading2(false)
        toast(err?.response?.data?.message).error()
      })

  }

  return (
    <Flex direction={"column"} className="border" h={"100vh"}>
      <Skeleton visible={loading1} maw={500} mx={"auto"} my={"auto"}>
        <Flex
          align={'center'}
          maw={500}
          mx={"auto"}
          direction={'column'}
          justify={'center'} mah={'100vh'} p={20}>
          <Logo />

          {currentOrder && <Flex my={20} direction={'column'}>
            <Text fw={500} size={"xl"} ta={"center"} mb={10}>Hi there 👋</Text>
            <Text fw={400}
            >
              Please confirm if your order #{orderId} with {currentOrder?.company?.name} has been delivered.</Text>
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

            <Flex className="flex flex-col sm:flex-row" my={10} align={"center"} justify={"center"}>
              <Button color="dark" fw={400}>No (I haven't received the order)</Button>
              <Space mx={"xs"} />
              <Popover width={200} position="bottom" withArrow shadow="md">
                <Popover.Target>
                  <Button color="red" fw={400}>Yes (I have received the order)</Button>
                </Popover.Target>
                <Popover.Dropdown>
                  <Text size="sm">Are you sure you've received the delivery?</Text>
                  <Flex justify={"space-between"} my={5}>
                    <Button color="black" size="xs">No</Button>
                    <Button color="red" size="xs">Yes</Button>
                  </Flex>
                </Popover.Dropdown>
              </Popover>
            </Flex>
          </Flex>}

        </Flex>
      </Skeleton>
    </Flex>
  );
}

export default ConfirmDelivery;