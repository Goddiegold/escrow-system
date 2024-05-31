import { Skeleton } from "@mantine/core";
import React from "react";

interface AppSkeletonProps {
    radius?: string | number,
    height?: string | number,
    width?: string | number,
    count?: number,
    className?: string,
}

const AppSkeleton: React.FC<AppSkeletonProps> = ({ count = 1, className, ...props }) => {

    return (
        <div className={className}>
            {
                Array(count).fill(null).map((_item, key) => (
                    <Skeleton
                        mb={5}
                        key={key}
                        {...props} />
                ))
            }
        </div>
    );
}

export default AppSkeleton;