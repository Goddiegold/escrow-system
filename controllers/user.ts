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
import { PrismaClient, User, user_role, Notification } from '@prisma/client';
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
        this.router.post("/reset-password-1", this.resetPassword1)
        this.router.put("/reset-password-3/:otl", this.resetPassword3)
        this.router.put("/update-profile", userAuth, this.updateProfile)
        this.router.put("/update-password", userAuth, this.updatePassword)
        this.router.get("/notifications", [userAuth, requireRole([user_role.company, user_role.vendor])], this.getNotifications)
    }

    login = async (req: Request, res: Response) => {
        const { error } = validateRequestBody(req.body, RequestType.SIGN_IN);
        if (error) return res.status(400).json({ message: error.details[0].message })

        try {
            const filter = {};
            const { email, password } = req.body;

            const companySlug = req?.query?.companySlug as string;

            if (companySlug) {
                const company = await this.prisma.company.findFirst({ where: { slug: companySlug } })
                if (!company) return res.status(404).json({ message: "Invalid login link!" })

                //@ts-ignore
                filter["companyId"] = company.id;
                //@ts-ignore
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
            const filter = {};
            const data = {};
            const { email } = req.body;
            const companySlug = req?.query?.companySlug as string;

            if (companySlug) {
                const company = await this.prisma.company.findFirst({ where: { slug: companySlug } })
                if (!company) return res.status(404).json({ message: "Invalid registration link!" })

                //@ts-ignore
                filter["companyId"] = company.id;

                //@ts-ignore
                data["companyId"] = company.id;

                //@ts-ignore
                data["role"] = user_role.vendor;
            } else {
                //@ts-ignore
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

            const userExists = await this.prisma.user.findFirst({
                where: {
                    id: userId,
                }
            })

            if (!userExists) {
                return res.status(404).json({ message: "User not found!" })
            }

            const result = await this.prisma.user.update({
                where: { id: userId },
                data: { ...req.body },
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

            return res.status(200).json({ result: { ...updatedUser, password: null } })
        } catch (error) {
            console.log(error);
            return res.status(500).json(errorMessage(error))
        }
    }

    resetPassword1 = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const user = await this.prisma.user.findFirst({
                where: { email },
                select: { name: true, id: true }
            })
            if (!user) return res.status(404).json({ message: "User not found!" })

            const { otl, expires } = generateOTL()

            await this.prisma.user.update({
                where: { id: user?.id },
                data: { otp: otl, otpDuration: new Date(expires) }
            })

            // mailService({
            //     subject: "A request has been made to reset your password",
            //     email,
            //     template: "forgotPassword",
            //     name: user.name,
            //     url: `${process.env.FRONTEN_URL}/reset-password/${otl}`
            // })
            return res.status(200).json({ message: "Check your mail!" })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Something went wrong!" })
        }
    }

    resetPassword3 = async (req: Request, res: Response) => {
        try {
            const { otl } = req.params;

            const user = await this.prisma.user.findFirst({
                where: {
                    otp: otl,
                    otpDuration: {
                        gt: new Date(Date.now())
                    }
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
                include: { order: { include: { customer: { select: { email: true, name: true } } } } },
                where: { ...filter }, 
            })
            return res.status(200).json({ result })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

}

