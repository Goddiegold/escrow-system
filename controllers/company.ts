import {
    errorMessage,
    slugify
} from '../shared/helpers';
import { Router, Request, Response } from 'express';
import { AuthenticatedRequest, IControllerBase } from '../shared/types';
import { requireRole, userAuth } from '../shared/middlewares';
import { PrismaClient, user_role } from '@prisma/client';


export default class CompanyController implements IControllerBase {

    public path = 'companies'
    public router = Router()

    constructor(private prisma: PrismaClient) {
        this.initRoutes()
    }

    public initRoutes(): void {

        this.router.get("/get-users",
            [userAuth, requireRole([user_role.company, user_role.admin])], this.getUsers)
        this.router.post("/register", [userAuth, requireRole([user_role.company])], this.addCompanyInfo)
        this.router.get("/company-info/:companySlug", this.getCompanyInfo)
        this.router.get("/all-companies", [userAuth, requireRole([user_role.admin])], this.getCompanies)
    }


    getUsers = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userRole = req?.query?.role as user_role;
            const companyId = req?.query?.companyId as string;
            const filter = {};
            if (companyId || req?.user?.companyId) {
                //@ts-ignore
                filter["companyId"] = companyId ?? req?.user?.companyId
            }
            const result = await this.prisma.user.findMany({
                select: { id: true, email: true, name: true, createdAt: true, companyId: true },
                where: { role: userRole, ...filter }
            });
            return res.status(201).json({ result })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    addCompanyInfo = async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (req?.user?.companyId) {
                return res.status(400).json({ message: "You've registered a company before!" })
            }

            const companyExist = await this.prisma.company.findFirst({
                where: {
                    OR: [
                        { email: req?.body?.email },
                        { name: req?.body?.name },
                        { slug: slugify(req?.body?.name) }
                    ]
                }
            })

            if (companyExist) return res.status(400).json({ message: "Company already registered!" })
            const company = await this.prisma.company.create({
                data: { ...req?.body, slug: slugify(req?.body?.name) }
            })
            await this.prisma.user.update({ where: { id: req?.user?.id }, data: { companyId: company.id } })
            return res.status(200).json({ result: company })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    getCompanyInfo = async (req: Request, res: Response) => {
        try {
            const companyExist = await this.prisma.company.findFirst({
                select: { id: true, name: true },
                where: { slug: req?.params?.companySlug }
            })
            if (!companyExist) return res.status(404).json({
                message: "Company doesn't exist!"
            })
            return res.status(200).json({ result: companyExist })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }

    getCompanies = async (req: Request, res: Response) => {
        try {
            const result = await this.prisma.company.findMany({
                orderBy: { createdAt: "desc" }
            })
            return res.status(200).json({ result })
        } catch (error) {
            return res.status(500).json(errorMessage(error))
        }
    }
}
