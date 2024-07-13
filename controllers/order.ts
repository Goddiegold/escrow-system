import {
    errorMessage,
    generateRandomNumberString,
    validateRequestBody
} from '../shared/helpers';
import { Router, Response, Request } from 'express';
import { AuthenticatedRequest, IControllerBase, RequestType } from '../shared/types';
import { requireRole, userAuth } from '../shared/middlewares';
import { Order, PrismaClient, User, notification_type, order_status, user_role } from '@prisma/client';
import mailService from '../shared/mailService';

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

        this.router.get("/all",
            [userAuth, requireRole([user_role.admin])],
            this.getCompanyOrders)

        this.router.get("/vendor-orders/:vendorId",
            [userAuth, requireRole([user_role.company,
            user_role.admin])],
            this.retrieveVendorOrders)

        this.router.get("/:orderId", this.getOrder)
            .patch("/:orderId", [userAuth,
                requireRole([user_role.vendor,
                user_role.company,
                user_role.admin])],
                this.updateOrder)

        this.router.get("/order-ref/:orderRef", this.getOrderRef)
        this.router.get("/init-payment/:orderRef", this.payForOrder)
        this.router.get("/verify-payment/:orderRef", this.verifyOrderPaymentStatus)

        this.router.post('/place-order',
            [userAuth, requireRole([user_role.company])],
            this.placeOrder)

        this.router.post("/confirm-delivery/:orderId", this.confirmOrder)
    }


    placeOrder = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { error } = validateRequestBody(req.body, RequestType.PLACE_ORDER);
            if (error) return res.status(400).json({ message: error.details[0].message })

            let customer: User | null;
            let vendors: User[] = [];

            const orderRef = `#${generateRandomNumberString(1, 100)}`
            const products = req?.body?.products as Record<string, any>[];

            const vendorEmails = [...new Set(products.map(item => item!.vendor as string))]

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

            for (const item of vendorEmails) {
                const userExist = await this.prisma.user.findFirst({
                    where: {
                        role: user_role.vendor,
                        companyId: req?.user?.companyId,
                        email: item,
                    }
                });

                if (!userExist) {
                    return res.status(400).json({
                        message: `Vendor: ${item} is not registered!`
                    });
                }
                else {
                    vendors!.push(userExist)
                }
            }

            const orders: Order[] = []

            await this.prisma.$transaction(async () => {
                for (const vendor of vendors) {
                    const orderProducts = products.filter(
                        (product: Record<string, string | number>) => product!.vendor === vendor.email)
                        .map((item: Record<string, string | number>) => {
                            const { vendor, ...rest } = item;
                            return rest;
                        });

                    const totalAmount = orderProducts.reduce((acc: number, product: any) => {
                        return acc + product.price;
                    }, 0);

                    const order = await this.prisma.order.create({
                        data: {
                            totalAmount,
                            vendorId: vendor.id,
                            customerId: customer.id,
                            products: orderProducts,
                            orderRef,
                            companyId: req.user?.companyId,
                        }
                    });

                    orders.push(order);
                }
            })

            return res.status(201).json({ result: orders })

        } catch (error) {
            return res.status(500).json(errorMessage(error, true))
        }
    }

    payForOrder = async (req: Request, res: Response) => {
        try {
            const orderRef = "#" + req?.params?.orderRef as string;
            const transactionRef = req?.query?.transactionRef as string;

            const orders = await this.prisma.order.findMany({
                where: {
                    orderRef,
                    // userPaid: false
                },
            })

            if (!orders || orders?.length === 0) return res.status(404).json({ message: "Order not found!" })

            if (orders[0]?.userPaid) {
                return res.status(400).json({ message: "This order has been paid for already!" })
            }

            await this.prisma.order.updateMany({
                where: { orderRef },
                data: {
                    transactionRef
                }
            })

            return res.status(200).json({
                message: "Updated record successfully!",
                result: { transactionRef }
            })
        } catch (error) {
            return res.status(500).json(errorMessage(error, true))
        }
    }

    verifyOrderPaymentStatus = async (req: Request, res: Response) => {
        try {
            const orderRef = "#" + req?.params?.orderRef as string;
            const transactionRef = req?.query?.transactionRef as string;

            const orders = await this.prisma.order.findMany({
                include: {
                    customer: { select: { name: true, email: true, } },
                    vendor: { select: { name: true, email: true } },
                    company: { select: { name: true, slug: true } }
                },
                where:
                {
                    orderRef,
                    transactionRef,
                    // userPaid: false
                }
            })

            if (!orders || orders?.length === 0) return res.status(404).json({ message: "Order not found!" })

            //call paystack api first to verify payment

            await this.prisma.order.updateMany({
                where: {
                    orderRef
                },
                data: {
                    userPaid: true,
                    userPaidOn: new Date()
                }
            })

            for (const order of orders) {
                await this.prisma.notification.create({
                    data: {
                        vendorId: order.vendorId,
                        companyId: order?.companyId,
                        type: notification_type.customer_placed_order,
                        orderId: order.id,
                        orderRef,
                    }
                });

                mailService({
                    subject: "An order has been placed on your store",
                    email: order?.vendor?.email,
                    customer: order?.customer?.name,
                    company: order.company?.name,
                    template: "orderPlacedOnStore",
                    name: order?.vendor?.name,
                    url: `${process.env.FRONTEND_URL}/${order?.company?.slug}/login?redirect=/dashboard/orders/pending-deliveries`
                })
            }


            const customer = orders[0].customer;
            const company = orders[0].company;

            mailService({
                subject: "Order placed successfully",
                email: customer!.email,
                orderRef,
                template: "orderPlaced",
                name: customer!.name,
                companyName: company?.name,
            })

            return res.status(200).json({ message: "Payment verified successfully!" })
        } catch (error) {
            return res.status(500).json(errorMessage(error, true))
        }
    }

    getCompanyOrders = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const companyId = req?.params?.companyId;
            const status = req?.query?.status as order_status;
            const filter:Record<string, any> = {};

            if (status) {
                const statusValue = (status === order_status.pending || status === order_status.delivered) ? status : undefined;
                if (statusValue === undefined) {
                    return res.status(400).json({ message: "Something went wrong!" })
                }

                filter["order_status"] = statusValue;
            }

            if (req.user?.role === user_role.company || req?.user?.role === user_role.vendor) {
                filter["companyId"] = companyId;

                if (req?.user.companyId !== companyId) {
                    return res.status(403).json({ message: "Forbidden!" })
                }

                const isVendor = req?.user?.role === user_role.vendor;
                if (isVendor) {
                    filter["vendorId"] = req?.user?.id;
                    filter["userPaid"] = true;
                }
            }



            const result = await this.prisma.order.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    vendor: { select: { id: true, name: true, email: true } },
                    customer: { select: { id: true, name: true, email: true, } },
                    company: { select: { id: true, name: true, email: true } }
                },
                where: { ...filter, }
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
                include: {
                    vendor: { select: { name: true } },
                    company: { select: { name: true } }
                },
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

    getOrderRef = async (req: Request, res: Response) => {
        try {
            const orderRef = "#" + req?.params?.orderRef as string;

            const orders = await this.prisma.order.findMany({
                select: {
                    totalAmount: true,
                    customer: { select: { email: true, name: true } },
                    userPaid: true,
                },
                where: {
                    orderRef,
                    // userPaid:false
                }
            })

            return res.status(200).json({ result: orders })
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

            const updateOrder = await this.prisma.order.update({
                include: {
                    customer: { select: { email: true, name: true } },
                    vendor: { select: { email: true, name: true } },
                    company: { select: { name: true } }
                },
                where: { id: orderId },
                data: {
                    order_status: orderStatus,
                    vendorDelivered: orderStatus === order_status.delivered ? true : false,
                    vendorDeliveredOn: orderStatus === order_status.delivered ? new Date() : null
                }
            })

            const orderIsCancelled = orderStatus === order_status.cancelled;
            const orderIsDelivered = orderStatus === order_status.delivered;

            if (orderIsCancelled || orderIsDelivered) {
                await this.prisma.notification.create({
                    data: {
                        companyId: result.companyId,
                        vendorId: updateOrder.vendorId,
                        orderId,
                        type: orderIsCancelled ? notification_type.order_cancelled :
                            notification_type.order_delivered,
                        message: `Updated by ${req?.user?.role}`
                    }
                })

                if (orderIsDelivered) {
                    mailService({
                        subject: `Confirm if your order ${updateOrder.orderRef} has been delivered`,
                        email: updateOrder.customer?.email,
                        template: "confirmOrderDelivery",
                        companyName: updateOrder.company?.name,
                        orderRef: updateOrder.orderRef,
                        url: `${process.env.FRONTEND_URL}/co nfirm-delivery/${updateOrder.id}`,
                        name: updateOrder.customer?.name,
                        vendor: updateOrder.vendor?.name
                    })
                } else {
                    mailService({
                        subject: `Order ${updateOrder.orderRef} has been cancelled`,
                        email: updateOrder.customer?.email,
                        template: "orderCancelled",
                        companyName: updateOrder.company?.name,
                        orderRef: updateOrder.orderRef,
                        name: updateOrder.customer?.name,
                        vendor: updateOrder.vendor?.name
                    })
                }
            }


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
                where: {
                    vendorId,
                    ...filter,
                    // userPaid: true,
                }
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

            const { rating, receivedOrder } = req?.body;

            await Promise.all([
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: {
                        userReceived: receivedOrder,
                        userReceivedOn: receivedOrder === true ? new Date() : null,
                    },
                }),
                await this.prisma.notification.create({
                    data: {
                        orderId,
                        orderRef: order.orderRef,
                        vendorId: order.vendorId,
                        companyId: order?.companyId,
                        type: notification_type.delivery_confirmed
                    }
                })
            ])

            if (rating) {
                await this.prisma.rating.create({
                    data: {
                        orderId,
                        ...rating,
                    }
                })
            }

            //credit vendor
            return res.status(200).json({
                message: "Order has being confirmed successfully!",
            })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }



}
