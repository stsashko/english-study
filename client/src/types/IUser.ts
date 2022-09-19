export interface IUser {
    id: number
    email?: string
    name?: string
    image?: string
    createdAt?: string
    updatedAt?: string
}

export interface ILogin {
    token: string
    user: IUser
}