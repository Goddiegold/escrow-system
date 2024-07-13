import { Button, Flex, Pagination } from "@mantine/core";
import { useState } from "react";


function usePagination<T>(data: T[], itemsPerPage = 7, withControls = true) {
    const [currentPage, setCurrentPage] = useState(1);

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, data.length);

    const totalPage = Math.ceil(data?.length / itemsPerPage)

    const paginateData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const paginatedData = paginateData()
    const PaginationBtnHelper = () => (
        <Pagination
            withControls={withControls}
            // color="purple"
            // className="!mx-auto"
            size={'md'}
            value={currentPage}
            total={totalPage}
            onChange={setCurrentPage}
        />
    )
    const PaginationBtn = () => {

        const disablePrevBtn = currentPage === 1;
        const disableNextBtn = totalPage === currentPage;

        const handlePrevBtn = () => {
            if (disablePrevBtn) return;
            setCurrentPage(prevValue => prevValue - 1)
        }

        const handleNextBtn = () => {
            if (disableNextBtn) return;
            setCurrentPage(prevValue => prevValue + 1)
        }

        return (<>
            {withControls ? <PaginationBtnHelper /> : <>
                <Flex direction={'row'} align={'center'}
                    // justify={'space-between'} 
                    className="sm:min-w-[250px] mt-[10px] lg:mt-0">
                    <Button
                        // size="xs"
                        className="disable-btnHelper"
                        disabled={disablePrevBtn}
                        variant={"transparent"}
                        color="dark"
                        onClick={handlePrevBtn}>Previous</Button>
                    <PaginationBtnHelper />
                    <Button
                        // size="xs"
                        className="disable-btnHelper"
                        disabled={disableNextBtn}
                        color="dark"
                        variant="transparent"
                        onClick={handleNextBtn}>Next</Button>
                </Flex>
            </>}

        </>)
    }


    return {
        PaginationBtn,
        data: paginatedData,
        startIndex,
        endIndex,
        currentPage,
        setCurrentPage,
    };
}

export default usePagination;