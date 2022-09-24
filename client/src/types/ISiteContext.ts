import { IUser } from "./IUser";

export interface ISiteContext {
    title: string | boolean
    setTitle: (title: string) => void
    titlePage: string | null
    setTitlePage: (titlePage: string) => void
    user:IUser | any
    setUser: (user:IUser|{}) => void
    authToken:string | boolean
    setAuthToken: (token:string) => void
}




