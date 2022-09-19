import { useContext } from "react";
import { SiteContext } from "../../contexts/SiteContext";

function useSiteData() {
    return useContext(SiteContext);
}

export default useSiteData;