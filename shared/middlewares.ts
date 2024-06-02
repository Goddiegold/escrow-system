import { PrismaClient, user_role } from '@prisma/client';
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import multer from 'multer';
import { AuthenticatedRequest } from './types';

const prisma = new PrismaClient()

/***error middleware */
export const errorHandler = (err: any, req: any, res: any, next: any) => {
    //Log the exception
    console.log(err.message, err);
    return res.status(500).send({ message: "Something Failed.." });
};


export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1]
        : null;
    if (!token) return res.status(401).json({ message: "Access denied!" })

    try {
        const decoded: any = jwt.verify(token, `${process.env.PRIVATE_KEY}`)
        const user = await prisma.user.findFirst({
            include: { company: { select: { id: true, name: true, slug: true } } },
            where: { id: decoded?.id },
        })
        if (!user) return res.status(404).json({ message: "User not found!" })
        //@ts-ignore
        req.user = { ...user, password: null }
        next()
    } catch (error) {
        console.log(error)
        // if(error instanceof J)
        return res.status(401).json({ message: "Not authorized !" })
    }
}

export const requireRole = (roles: user_role[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        //@ts-ignore
        if (req.user && roles.includes(req.user.role)) {
            return next(); // User has the required role
        } else {
            return res.status(403).json({ message: 'Access Denied' }); // User doesn't have the required role
        }
    };
};

// Multer setup
const storage = multer.memoryStorage();
export const upload = multer({ storage });

