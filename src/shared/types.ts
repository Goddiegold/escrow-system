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
    createdAt?: Date
}

export enum user_role {
    vendor = "vendor",
    company = "company",
    customer = "customer",
    admin = "admin"
}

export enum order_status {
    pending = 'pending',
    delivered = 'delivered',
    cancelled = 'cancelled',
    delivery_confirmed = "delivery_confirmed",
    pending_confirmation = "pending_confirmation"
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

export type Product = {
    id: string,
    details: string | null,
    name: string,
    price: number | null,
}

export type Order = {
    id: string,
    products: Product[],
    vendorId: string | null,
    vendor: User | null,
    customerId: string | null,
    customer: User | null,
    totalAmount: number | null,
    vendorDelivered: boolean,
    vendorDeliveredOn: Date | null,
    userReceived: boolean,
    userReceivedOn: Date | null,
    companyId: string | null,
    createdAt: Date,
    updatedAt: Date,
    order_status: order_status
    company: Company | null,
    orderRef: string | null,
}

export enum notification_type {
    customer_placed_order = 'customer_placed_order',  //for vendor 
    delivery_confirmed = 'delivery_confirmed', //for vendor
    order_delivered = 'order_delivered', //for the company
    order_cancelled = 'order_cancelled', //for the comapany
}

export type NotificationType = {
    id: string
    type: notification_type
    orderId: string | null
    orderRef: string | null
    vendorId: string | null
    vendor: User | null,
    companyId: string | null
    message: string | null
    order: Order | null,
    createdAt: Date | null
}