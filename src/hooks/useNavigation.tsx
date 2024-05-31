import { useNavigate } from "react-router-dom";


const useNavigation = () => {
    const navigate = useNavigate();
    return (path: string) => {
        navigate(path, { state: { prevPath: window.location.pathname } });
    }
}

export default useNavigation;   