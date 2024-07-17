import { Navigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { user_role } from "@/shared/types";

interface PrivateProps {
    roles: user_role[],
    children: React.ReactNode | React.ReactNode[];
}

const PrivateRoute: React.FC<PrivateProps> = ({ roles, children }) => {
    const { user } = useUserContext()
    if (user && !roles.includes(user.role)) {
        return <Navigate to={"/dashboard"} />
    } else {
        return <>{children}</>;
    }
}

export default PrivateRoute;