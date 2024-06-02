import {
    comparePasswords,
    errorMessage,
    filterUserProfile,
    generateAuthToken,
    generateHashedPassword,
    generateOTL,
    uploadFile,
    validateRequestBody
} from '../shared/helpers';
import { Router, Request, Response, query } from 'express';
import { AuthenticatedRequest, IControllerBase, RequestType } from '../shared/types';
import { requireRole, upload, userAuth } from '../shared/middlewares';
import { PrismaClient, User, user_role} from '@prisma/client';

export default class OrderController implements IControllerBase {

    public path = 'orders'
    public router = Router()

    constructor(private prisma: PrismaClient) {
        this.initRoutes()
    }

    public initRoutes(): void {
        this.router.get('/company-orders/:companyId',
            [userAuth, requireRole([user_role.company,
            user_role.admin,
            user_role.vendor])],
            this.getCompanyOrders)

        this.router.get("/:orderId", this.getOrder)

        this.router.post('/place-order',
            [userAuth, requireRole([user_role.company])],
            this.placeOrder)
    }


    placeOrder = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { error } = validateRequestBody(req.body, RequestType.PLACE_ORDER);
            if (error) return res.status(400).json({ message: error.details[0].message })

            let customer: User | null;

            customer = await this.prisma.user.findFirst({
                where: {
                    email: req?.body?.customerEmail,
                    role: user_role.customer,
                    companyId: req?.user?.companyId
                }
            })

            if (!customer) {
                customer = await this.prisma.user.create({
                    data: {
                        email: req?.body?.customerEmail,
                        role: user_role.customer,
                        companyId: req?.user?.companyId,
                        name: req.body?.customerName
                    }
                })
            }

            const vendor = await this.prisma.user.findFirst({
                where: {
                    id: req?.body?.vendorId,
                    role: user_role.vendor,
                    companyId: req?.user?.companyId
                }
            })

            if (!vendor) {
                return res.status(404).json({ message: "Vendor not found!" })
            }


            const order = await this.prisma.order.create({
                data: {
                    productId: req?.body?.productId,
                    productDetails: req?.body?.productDetails ?? "",
                    productName: req?.body?.productName,
                    vendorId: vendor.id,
                    customerId: customer.id,
                    amount: req?.body?.amount,
                    companyId: req?.user?.companyId
                }
            })

            return res.status(201).json({ result: order })

        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    getCompanyOrders = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const companyId = req?.params?.companyId;
            const status = req?.query?.status as string;
            const filter = {};

            if (status) {
                const statusValue = status === "pending" ? false : status === "success" ? true : undefined;
                if (statusValue === undefined) {
                    return res.status(400).json({ message: "Something went wrong!" })
                }

                //@ts-ignore
                filter["vendorDelivered"] = statusValue;
            }

            if (req.user?.role === user_role.company || req?.user?.role === user_role.vendor) {
                if (req?.user.companyId !== companyId) {
                    return res.status(403).json({ message: "Forbidden!" })
                }
            }

            if (req?.user?.role === user_role.vendor) {
                //@ts-ignore
                filter["vendorId"] = req?.user?.id
            }

            const result = await this.prisma.order.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    vendor: { select: { id: true, name: true, email: true } },
                    customer: { select: { id: true, name: true, email: true, } },
                    company: { select: { id: true, name: true, email: true } }
                },
                where: { companyId, ...filter, }
            })
            return res.status(200).json({ result })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    getOrder = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const orderId = req?.params?.orderId
            const result = await this.prisma.order.findFirst({ where: { id: orderId } })
            return res.status(201).json({ result })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    updateOrder = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const orderId = req?.params?.orderId
            const result = await this.prisma.order.findFirst({ where: { id: orderId } })

            if (!result) {
                return res.status(404).json({ message: "Order Not Found!" })
            }
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }
}
