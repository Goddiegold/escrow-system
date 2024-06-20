import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { DashboardHome } from "./pages/dashboard/Home";
import VerifyOtp from "./pages/VerifyOtp";
import Settings from "./pages/dashboard/Settings";
import RegisteredVendors from "./pages/dashboard/RegisteredVendors";
import Orders from "./pages/dashboard/Orders";
import AllVendorOrCompanyOrders from "./pages/dashboard/AllVendorOrCompanyOrders";
import RegisteredCompanies from "./pages/dashboard/RegisteredCompanies";

const router = createBrowserRouter([
    {
        path: "/dashboard",
        errorElement: <ErrorPage />,
        element: <DashboardLayout />,
        children: [
            {
                path: "/dashboard",
                element: <DashboardHome />,
            },
            {
                path: "/dashboard/registered-vendors",
                element: <RegisteredVendors />
            },
            {
                path: "/dashboard/registered-companies",
                element: <RegisteredCompanies/>
            },
            {
                path: "/dashboard/orders",
                element: <Orders />,
            },
            {
                path: "/dashboard/orders/:tabValue",
                element: <Orders />,
            },
            {
                path: "/dashboard/vendor-orders/:vendorId",
                element: <AllVendorOrCompanyOrders />
            },
            {
                path: "/dashboard/company-orders/:companyId",
                element: <AllVendorOrCompanyOrders />
            },
            {
                path: "/dashboard/settings",
                element: <Settings />,
            },
            {
                path: "/dashboard/settings/:tabValue",
                element: <Settings />,
            },
        ],
    },
    {
        path: "/",
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/register",
                element: <Register />,
            },
            {
                path: "/login/:companySlug",
                element: <Login />,
            },
            {
                path: "/register/:companySlug",
                element: <Register />,
            },
            {
                path: "/not-found",
                element: <NotFound />
            },
            {
                path: "/verify-otp",
                element: <VerifyOtp />
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }

]);

export default router;
