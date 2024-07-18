
// #228be6
// var(--mantine-color-blue-filled)

import { Flex, Text } from "@mantine/core";

const Logo = () => {
    return (
        <Flex className="cursor-pointer">
        <div className='bg-color-1 h-[30px] w-[30px] rounded-md mr-[10px]'>

        </div>
        <Text fw={800} c={'blue'} size='lg'
            className=''>Escrow</Text>
    </Flex>
      );
}
 
export default Logo;
