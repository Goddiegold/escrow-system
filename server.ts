
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import compression from "compression";
import helmet from "helmet"
import morgan from "morgan";

import App from "./app";
import { errorHandler } from "./shared/middlewares";
import startup from "./shared/startup";
import UserController from "./controllers/user";
import { PrismaClient } from "@prisma/client";
import CompanyController from "./controllers/company";
import OrderController from "./controllers/order";


const port = process.env.PORT || 5000;

startup()
const prisma = new PrismaClient()

const app = new App({
    port: +port,
    middlewares: [
        helmet(),
        morgan('dev'),
        cors(),
        compression(),
        mongoSanitize(),
        express.urlencoded({ extended: true, limit: "10mb" }),
        express.json({ limit: "10mb" }),
        errorHandler,
    ],
    controllers: [
        new UserController(prisma),
        new CompanyController(prisma),
        new CompanyController(prisma),
        new OrderController(prisma)
    ]
})



app.listen()

prisma.$connect().then(res => {
    console.log("info: Connected to the DB!")
}).catch(err => {
    throw new Error("info: Couldn't connect to DB!")
})


// jobs(prisma);
