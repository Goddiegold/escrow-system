import {
    comparePasswords,
    errorMessage,
    filterUserProfile,
    generateAuthToken,
    generateHashedPassword,
    generateOTL,
    generateOTP,
    validateRequestBody
} from '../shared/helpers';
import { Router, Request, Response } from 'express';
import { AuthenticatedRequest, IControllerBase, RequestType } from '../shared/types';
import { requireRole, userAuth } from '../shared/middlewares';
import { Company, PrismaClient, User, user_role } from '@prisma/client';
import mailService from '../shared/mailService';


export default class UserController implements IControllerBase {

    public path = 'users'
    public router = Router()

    constructor(private prisma: PrismaClient) {
        this.initRoutes()
    }

    public initRoutes(): void {
        this.router.post('/login', this.login)
        this.router.post('/register', this.register)
        this.router.get('/profile', userAuth, this.getProfile)
        this.router.post("/reset-password", this.resetPassword1)
        this.router.post("/reset-password/:otl", this.resetPassword2)
        this.router.put("/update-profile", userAuth, this.updateProfile)
        this.router.put("/update-password", userAuth, this.updatePassword)
        this.router.get("/notifications", [userAuth, requireRole([user_role.company, user_role.vendor])], this.getNotifications)
        this.router.put("/notifications/:notificationId",
            [userAuth, requireRole([user_role.company, user_role.vendor])], this.markNotificationAsRead)

        this.router.get("/wallet-history", [userAuth, requireRole([user_role.vendor])], this.vendorPaymentHistory)
        this.router.post("/make-withdrawal", [userAuth, requireRole([user_role.vendor])], this.makeWithdrawal)
    }

    login = async (req: Request, res: Response) => {
        const { error } = validateRequestBody(req.body, RequestType.SIGN_IN);
        if (error) return res.status(400).json({ message: error.details[0].message })

        try {
            const filter: Record<any, string | []> = {}
            const { email, password } = req.body;

            const companyId = req?.query?.companyId as string;

            if (companyId) {
                const company = await this.prisma.company.findFirst({ where: { id: companyId } })
                if (!company) return res.status(404).json({ message: "Invalid login link!" })

                filter["companyId"] = company.id;

                filter["role"] = user_role.vendor;
            } else {
                //@ts-ignore
                filter["role"] = { in: [user_role.admin, user_role.company] }
            }

            const user = await this.prisma.user.findFirst({
                include: { company: { select: { id: true, name: true, slug: true } } },
                where: {
                    email,
                    ...filter,
                }
            })
            if (!user) return res.status(404).json({ message: 'User not found!' })

            const validPassword = await comparePasswords(password, user.password as string);
            if (!validPassword) return res.status(400).json({ message: "Invalid email or password" });

            const token = generateAuthToken(user.id)

            return res.status(200)
                .header("Authorization", token)
                .header("access-control-expose-headers", "Authorization")
                .json({
                    message: "Logged in successfully!",
                    result: filterUserProfile(user),
                })
        } catch (error) {
            console.log(error)
            return res.status(500).json(errorMessage(error, true))
        }
    }

    register = async (req: Request, res: Response) => {
        const { error } = validateRequestBody(req.body, RequestType.SIGN_UP);
        if (error) return res.status(400).json({ message: error.details[0].message })
        try {
            const filter: Record<string, string> = {};
            const data: Record<string, string> = {};
            const { email } = req.body;
            const companyId = req?.query?.companyId as string;

            if (companyId) {
                const company = await this.prisma.company.findFirst({ where: { id: companyId } })
                if (!company) return res.status(404).json({ message: "Invalid registration link!" })

                filter["companyId"] = company.id;

                data["companyId"] = company.id;

                data["role"] = user_role.vendor;
            } else {
                data["role"] = user_role.company;
            }

            const userExists = await this.prisma.user.findFirst({
                where: { email, ...filter }
            })
            if (userExists) return res.status(404).json({ message: 'Email already registered!' })

            const password = generateHashedPassword(req.body?.password)
            const { otp, expires } = generateOTP()

            const user = await this.prisma.user.create({
                data: {
                    ...req.body,
                    ...data,
                    password,
                    otp,
                    otpDuration: new Date(expires),
                }
            })

            const token = generateAuthToken(user.id)

            return res.status(200)
                .header("Authorization", token)
                .header("access-control-expose-headers", "Authorization")
                .json({
                    message: "Account Created Succesffully!",
                    result: filterUserProfile(user),
                })
        } catch (error) {
            return res.status(500).json(errorMessage(error, true))
        }
    }

    getProfile = async (req: AuthenticatedRequest, res: Response) => {
        return res.status(200).json({
            result: filterUserProfile(req?.user)
        })
    }

    verifyAccount = async (req: AuthenticatedRequest, res: Response) => {
        const currentUser = req?.user as User;
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    email: currentUser.email,
                    otp: req?.body?.otp,
                    otpDuration: {
                        gt: new Date(),
                    },
                },
            })

            if (!user) {
                return res.status(400).json({ message: "Invalid or expired token!" })
            }

            const updatedUser = await this.prisma.user.update({
                where: { id: currentUser.id },
                data: { emailVerified: true },
            })

            return res.status(200).json({ result: filterUserProfile(updatedUser) })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    updateProfile = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.id;
            const body = req?.body as Record<string, string>;

            const userExists = await this.prisma.user.findFirst({
                where: {
                    id: userId,
                }
            })

            if (!userExists) {
                return res.status(404).json({ message: "User not found!" })
            }

            if (req?.user?.email !== body?.email) {
                const userWithEmail = await this.prisma.user.findFirst({
                    where: {
                        email: body?.email,
                        companyId: req?.user?.companyId,
                        id: {
                            not: { equals: userExists.id }
                        }
                    }
                })
                if (userWithEmail) return res.status(400).json({ message: "Email used by another user!" })
            }
            const result = await this.prisma.user.update({
                where: { id: userId },
                data: body,
            })

            return res.status(200).json({
                message: "Update Profile Successfully!",
                result
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json(errorMessage(error))
        }
    }

    updatePassword = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const currentUser = req?.user
            const { oldPassword, newPassword } = req.body;
            const userExists = await this.prisma.user.findFirst({
                where: { id: currentUser?.id },
                select: {
                    password: true
                },
            })

            if (!userExists) {
                return res.status(404).json({ message: "User not found!" })
            }
            const isPassworValid = await comparePasswords(oldPassword, userExists.password as string)
            if (!isPassworValid) {
                return res.status(400).json({ message: "Incorrect Password!" })
            }

            const password = generateHashedPassword(newPassword)
            const updatedUser = await this.prisma.user.update({ where: { id: currentUser?.id }, data: { password } })

            return res.status(200).json({ message: "Updated password successfully!" })
        } catch (error) {
            console.log(error);
            return res.status(500).json(errorMessage(error))
        }
    }

    resetPassword1 = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const companyId = req?.query?.companyId as string;
            const filter: Record<string, string> = {}
            let company: Company | null = null;

            if (companyId) {
                company = await this.prisma.company.findFirst({ where: { id: companyId } });
                if (!company) return res.status(404).json({ message: "Company not found!" })
                filter["companyId"] = companyId
                filter["role"] = user_role.vendor
            }

            const user = await this.prisma.user.findFirst({
                where: { email, ...filter },
                select: { name: true, id: true }
            })
            if (!user) return res.status(404).json({ message: "User not found!" })

            const { otl, expires } = generateOTL()

            await this.prisma.user.update({
                where: { id: user?.id, },
                data: { otp: otl, otpDuration: new Date(expires) }
            })

            mailService({
                subject: "A request has been made to reset your password",
                email,
                template: "forgotPassword",
                name: user.name,
                url: `${process.env.FRONTEND_URL}${company ? `/${company?.slug}` : ""}/reset-password/${otl}`
            })
            return res.status(200).json({ message: "Check your mail!" })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Something went wrong!" })
        }
    }

    resetPassword2 = async (req: Request, res: Response) => {
        try {
            const { otl } = req.params;
            const filter: Record<string, string> = {}
            const companyId = req?.query?.companyId as string;
            let company: Company | null = null;

            if (companyId) {
                company = await this.prisma.company.findFirst({ where: { id: companyId } });
                if (!company) return res.status(404).json({ message: "Company not found!" })
                filter["companyId"] = companyId
                filter["role"] = user_role.vendor
            }


            const user = await this.prisma.user.findFirst({
                where: {
                    otp: otl,
                    otpDuration: {
                        gt: new Date(Date.now())
                    },
                    ...filter
                },
                select: {
                    email: true,
                    id: true,
                }
            })

            const password = generateHashedPassword(req.body.password)

            if (user) {
                await this.prisma.user.update({
                    where: { id: user?.id },
                    data: { password, otp: null }
                })
                return res.status(200).json({ message: "Successfully updated passsword!" })
            } else {
                return res.status(404).json({ message: "Invalid Token or Token Expired" })
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Something went wrong!" })
        }


    }

    getNotifications = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const currentUser = req?.user
            const filter = {};

            if (currentUser?.role === user_role.company) {
                //@ts-ignore
                filter["companyId"] = currentUser?.companyId
            } else {
                //@ts-ignore
                filter["vendorId"] = currentUser?.id
            }
            const result = await this.prisma.notification.findMany({
                include: {
                    vendor: { select: { id: true, name: true } },
                    order: {
                        include: { customer: { select: { email: true, name: true } } }
                    }
                },
                where: { ...filter, read: false },
                orderBy: {
                    createdAt: "desc"
                }
            })
            return res.status(200).json({ result })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    markNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const filter = {};
            const currentUser = req?.user;
            const notificationId = req?.params?.notificationId as string;

            if (currentUser?.role === user_role.company) {
                //@ts-ignore
                filter["companyId"] = currentUser?.companyId
            } else {
                //@ts-ignore
                filter["vendorId"] = currentUser?.id
            }

            const notificationExist = await this.prisma.notification.findFirst({
                where: { id: notificationId, ...filter }
            })

            if (!notificationExist) return res.status(404).json({ message: "Notification not found!" })
            await this.prisma.notification.update({ where: { id: notificationId }, data: { read: true } })

            return res.json({ message: "Updated successfully!" })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    vendorPaymentHistory = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const credits = await this.prisma.order.findMany({
                where: { vendorId: req?.user?.id, userPaid: true },
                orderBy: { userReceivedOn: "desc" },
                select: { orderRef: true, totalAmount: true, userReceivedOn: true, },
            })
            const debits = await this.prisma.withdrawalRecord.findMany({
                where: { vendorId: req?.user?.id }, orderBy: {
                    createdAt: "desc"
                }
            })
            return res.status(200).json({ result: { credits, debits } })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    makeWithdrawal = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const amount = req?.body?.amount as number;
            const currentUser = req?.user as User;

            if (amount > currentUser.wallet!) {
                return res.status(400).json({ message: "Insufficient funds!" })
            }

            const updatedUser = await this.prisma.user.update({
                where: { id: currentUser?.id },
                data: { wallet: currentUser.wallet! - amount }
            })

            const newWithdrawal = await this.prisma.withdrawalRecord.create({
                data: { vendorId: currentUser?.id, amount }
            })

            return res.status(200)
                .json({
                    result: {
                        user: { ...updatedUser, password: null },
                        newWithdrawal
                    },
                    message: "Your request is been processed!",
                })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

}

