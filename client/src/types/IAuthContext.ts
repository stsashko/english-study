import { IUser } from "./IUser";

export interface IAuthContext {
    user:IUser | any
    setUser: (user:IUser|{}) => void
    authToken:string | boolean
    setAuthToken: (token:string) => void
}




