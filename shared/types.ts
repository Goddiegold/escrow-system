import { Company, User } from "@prisma/client";
import { Router, Request } from "express";

export interface IControllerBase {
    initRoutes(): void
    path: string,
    router: Router
}

export enum RequestType {
    INVITE_USER = "INVITE_USER",
    SIGN_IN = "SIGN_IN",
    SIGN_UP = "SIGN_UP",
    PAYMENT_REMINDER = "PAYMENT_REMINDER",
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    PLACE_ORDER = "PLACE_ORDER"
}

export type MailContentType = {
    eventId?: string,
    eventName?: string,
    name?: string,
    email?: string,
    requestType: RequestType,
    url?: string,
    roomId?: string,
    otl?: string,
    eventDate?: string
}

export interface AuthenticatedRequest extends Request {
    user?: User & { company: Company }; // Assuming User is the correct type
    // company?: Company
}

export type MulterFile = {
    [x: string]: Express.Multer.File[];
}