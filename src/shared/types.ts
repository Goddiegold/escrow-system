export type User = {
    id: string,
    name: string,
    email: string,
    role: user_role,
    emailVerified: boolean,
    company?: Company,
    companyId?: string
}

export type Company = {
    id: string,
    name: string,
    slug: string,
}

export enum user_role {
    vendor = "vendor",
    company = "company",
    customer = "customer",
    admin = "admin"
}

export enum Action_Type {
    USER_TOKEN = "USER_TOKEN",
    USER_PROFILE = "USER_PROFILE",
    LOGOUT_USER = "LOGOUT_USER"
}
export interface UserContextType {
    isLoggedIn: boolean,
    user: User | null,
    userDispatch: React.Dispatch<{ payload?: any, type: Action_Type }>
}


export type Order = {
    id: string,
    productId: string,
    productDetails: string | null,
    productName: string,
    vendorId: string | null,
    vendor: User | null,
    customerId: string | null,
    customer: User | null,
    amount: number | null,
    vendorDelivered: boolean,
    vendorDeliveredOn: Date | null,
    userReceived: boolean,
    userReceivedOn: Date | null,
    companyId: string | null,
    createdAt: Date,
    updatedAt: Date,
}