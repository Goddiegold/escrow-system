import { useUserContext } from '@/context/UserContext';
import { user_role } from '@/shared/types';
import { Grid } from '@mantine/core';
import CompanyDashboardHome from "@/shared/dashboard/company/Home";


export function DashboardHome() {
    const { user } = useUserContext()
    return (
        <>
            <Grid>
                {user?.role === user_role.company && <CompanyDashboardHome />}
            </Grid>


        </>
    );
}