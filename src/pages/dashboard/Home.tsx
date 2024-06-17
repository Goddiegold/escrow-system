import { useUserContext } from '@/context/UserContext';
import { user_role } from '@/shared/types';
import { Grid } from '@mantine/core';
import CompanyDashboardHome from "@/components/shared/dashboard/company/Home";
import VendorDashboardHome from "@/components/shared/dashboard/vendors/Home";


export function DashboardHome() {
    const { user } = useUserContext()
    return (
        <>
            {user?.role === user_role.company && <CompanyDashboardHome />}
            {user?.role === user_role.vendor && <VendorDashboardHome />}
        </>
    );
}