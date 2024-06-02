import {
    comparePasswords,
    errorMessage,
    filterUserProfile,
    generateAuthToken,
    generateHashedPassword,
    generateOTL,
    generateOTP,
    uploadFile,
    validateRequestBody
} from '../shared/helpers';
import { Router, Request, Response, query } from 'express';
import { AuthenticatedRequest, IControllerBase, RequestType } from '../shared/types';
import { requireRole, upload, userAuth } from '../shared/middlewares';
import { PrismaClient, User, user_role } from '@prisma/client';
import { compareAsc } from 'date-fns';


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
}

