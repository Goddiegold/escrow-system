import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { DashboardHome } from "./pages/dashboard/Home";
import VerifyOtp from "./pages/VerifyOtp";

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
                path: "/not-found",
                element: <NotFound />
            }, 
            {
                path:"/verify-otp", 
                element:<VerifyOtp/>
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }

]);

export default router;
