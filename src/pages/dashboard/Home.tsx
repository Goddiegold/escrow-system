import { useUserContext } from '@/context/UserContext';
import { user_role } from '@/shared/types';
import CompanyDashboardHome from "@/components/dashboard/company/Home";
import VendorDashboardHome from "@/components/dashboard/vendors/Home";
import AdminDashboardHome from "@/components/dashboard/admin/Home";


export function DashboardHome() {
    const { user } = useUserContext()
    return (
        <>
            {user?.role === user_role.company && <CompanyDashboardHome />}
            {user?.role === user_role.vendor && <VendorDashboardHome />}
            {user?.role === user_role.admin && <AdminDashboardHome />}
        </>
    );
}