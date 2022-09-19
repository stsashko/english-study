import { createContext } from "react";
import { ISiteContext } from "./../../types/ISiteContext";

export const SiteContext = createContext<ISiteContext>({
    title: '',
    setTitle: () => {},
    titlePage: '',
    setTitlePage: () => {},
    user: {},
    setUser: () => {},
});