import {
    errorMessage,
    validateRequestBody
} from '../shared/helpers';
import { Router, Response } from 'express';
import { AuthenticatedRequest, IControllerBase, RequestType } from '../shared/types';
import { requireRole, userAuth } from '../shared/middlewares';
import { PrismaClient, User, order_status, user_role } from '@prisma/client';

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

        this.router.get("/all", [userAuth, requireRole([user_role.admin])], this.getCompanyOrders)

        this.router.get("/vendor-orders/:vendorId",
            [userAuth, requireRole([user_role.company, user_role.admin])],
            this.retrieveVendorOrders)

        this.router.get("/:orderId", this.getOrder)
            .patch("/:orderId", [userAuth, requireRole([user_role.vendor,
            user_role.company, user_role.admin])], this.updateOrder)

        this.router.post('/place-order',
            [userAuth, requireRole([user_role.company])],
            this.placeOrder)

        this.router.get("/confirm-order/:orderId", this.confirmOrder)
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
            const status = req?.query?.status as order_status;
            const filter = {};

            if (status) {
                const statusValue = (status === order_status.pending || status === order_status.delivered) ? status : undefined;
                if (statusValue === undefined) {
                    return res.status(400).json({ message: "Something went wrong!" })
                }

                //@ts-ignore
                filter["order_status"] = statusValue;
            }

            if (req.user?.role === user_role.company || req?.user?.role === user_role.vendor) {
                //@ts-ignore
                filter["companyId"] = companyId;

                if (req?.user.companyId !== companyId) {
                    return res.status(403).json({ message: "Forbidden!" })
                }

                const isVendor = req?.user?.role === user_role.vendor;
                if (isVendor) {
                    //@ts-ignore
                    filter["vendorId"] = req?.user?.id;
                }
            }



            const result = await this.prisma.order.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    vendor: { select: { id: true, name: true, email: true } },
                    customer: { select: { id: true, name: true, email: true, } },
                    company: { select: { id: true, name: true, email: true } }
                },
                where: { ...filter }
            })
            return res.status(200).json({ result })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    getOrder = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const orderId = req?.params?.orderId
            const result = await this.prisma.order.findFirst({
                include: { company: { select: { name: true } } },
                where: { id: orderId }
            })
            if (!result) {
                return res.status(404).json({ message: "Order Not Found!" })
            }
            return res.status(200).json({ result })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    updateOrder = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const orderId = req?.params?.orderId;
            const filter = {};

            if (req.user?.role === user_role.vendor) {
                //@ts-ignore
                filter["vendorId"] = req?.user?.id
            }

            if ((req?.user?.role === user_role.vendor) ||
                (req?.user?.role === user_role.company)) {
                //@ts-ignore
                filter["companyId"] = req?.user?.companyId
            }

            const result = await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    ...filter,
                }
            })

            if (!result) {
                return res.status(404).json({ message: "Order Not Found!" })
            }

            const orderStatus = req?.body?.orderStatus as order_status;

            if ((orderStatus !== order_status.cancelled) && (orderStatus !== order_status.delivered)) {
                return res.status(400).json({ message: "Something went wrong!" })
            }

            await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    order_status: orderStatus,
                    vendorDelivered: orderStatus === order_status.delivered ? true : false,
                    vendorDeliveredOn: orderStatus === order_status.delivered ? new Date() : null
                }
            })

            return res.status(200).json({ message: "Update order status successfully!" })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    retrieveVendorOrders = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const vendorId = req?.params?.vendorId;

            const status = req?.query?.status as order_status;
            const filter = {};

            if (status) {
                const statusValue = (status === order_status.pending ||
                    status === order_status.delivered) ? status : undefined;
                if (statusValue === undefined) {
                    return res.status(400).json({ message: "Something went wrong!" })
                }

                //@ts-ignore
                filter["order_status"] = statusValue;
            }

            const vendorExist = await this.prisma.user.findFirst({
                where: { role: user_role.vendor, id: vendorId }
            })

            if (!vendorExist) {
                return res.status(404).json({ message: "Vendor doesn't exist!" })
            }

            if (req?.user?.role === user_role.company &&
                req?.user?.companyId !== vendorExist.companyId) {
                return res.status(403).json({ message: "Forbidden!", redirect: true })
            }

            const result = await this.prisma.order.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    vendor: { select: { id: true, name: true, email: true } },
                    customer: { select: { id: true, name: true, email: true, } },
                    company: { select: { id: true, name: true, email: true } }
                },
                where: { vendorId, ...filter }
            })
            return res.status(200).json({ result })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    confirmOrder = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const orderId = req.params?.orderId
            const order = await this.prisma.order.findFirst({ where: { id: orderId } })
            if (!order) {
                return res.status(404).json({ message: "Order was not found!" })
            }
            await this.prisma.order.update({
                where: { id: orderId },
                data: { userReceived: true, userReceivedOn: new Date() }
            })

            //credit vendor
            return res.status(200).json({ message: "Order has being confirmed successfully!" })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }
}
