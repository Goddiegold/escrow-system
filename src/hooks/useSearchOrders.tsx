import { Order } from "@/shared/types";
import { ActionIcon, TextInput, TextInputProps } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";


const useSearchOrders = (orders: Order[]) => {
    const [query, setQuery] = useState("")
    const [debouncedQuery] = useDebouncedValue(query, 300);
    const [queryResult, setQueryResult] = useState<Order[]>([])
    const dataNotFound = (orders?.length === 0) || (queryResult?.length === 0 && !!query)
    const dataFound = orders && (orders?.length > 5 ||
        (!!query && queryResult?.length > 5))

    useEffect(() => {
        if (!debouncedQuery
            // || debouncedQuery.trim().length < 2
        ) {
            setQueryResult([]);
            return;
        }

        const lowercasedQuery = debouncedQuery.trim().toLowerCase();
        const filteredResults = orders.filter(order => {
            const customer = order?.customer;
            const vendor = order?.vendor;

            const filterParams = order.orderRef?.includes(lowercasedQuery)
                ||
                (customer?.email.toLowerCase().includes(lowercasedQuery) ||
                    customer?.name?.includes(lowercasedQuery))
                ||
                (vendor?.email.toLowerCase().includes(lowercasedQuery) ||
                    vendor?.name?.includes(lowercasedQuery));

            if (filterParams) return order;
        });

        setQueryResult(filteredResults);
        // }, [debouncedQuery, orders?.length]);
    }, [debouncedQuery]);

    const SearchInput = (props: TextInputProps) => (<TextInput
        rightSection={
            <ActionIcon variant="transparent" onClick={() => {
                setQuery("")
                setQueryResult([])
            }}>
                <X color="gray" />
            </ActionIcon>
        }
        className="w-full lg:w-[50%] 2xl:w-[20%]"
        value={query}
        autoFocus
        onChange={e => setQuery(e.target.value)}
        my={10}
        placeholder="Search by email/name of customer/vendor or order ref"
        classNames={{
            // input:"placeholder:!font-normal"
        }}
        leftSection={<MagnifyingGlass size={20} />}
        {...props}
    />
    )

    return {
        SearchInput,
        queryResult,
        query,
        dataNotFound,
        dataFound
    }
}

export default useSearchOrders;