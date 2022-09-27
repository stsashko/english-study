import { IUser } from "./IUser";

export interface IAuthContext {
    user:IUser | any
    setUser: (user:IUser|{}) => void
}




