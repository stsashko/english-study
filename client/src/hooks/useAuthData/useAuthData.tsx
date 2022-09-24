import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

function useAuthData() {
    return useContext(AuthContext);
}

export default useAuthData;