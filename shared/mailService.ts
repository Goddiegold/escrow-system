import nodemailer from "nodemailer";
import mg from "nodemailer-mailgun-transport";
import handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";
import { RequestType } from "./types";
import moment from "moment";


function convertDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date))
}

async function sendEmail(mailData: any) {
    try {
        const FRONTEND_URL = process.env.FRONTEND_URL;

        const getContent = () => {
            //@ts-ignore
            return {
                [RequestType.PAYMENT_REMINDER]: {
                    ...mailData,
                    subject: `Invoice for ${mailData.reason}`,
                    template: "paymentReminder",
                    url: `http://localhost:5173/payment/${mailData.id}`,
                    issueDate: moment(mailData.issueDate).format("DD/MM/YYYY"),
                    dueDate: moment(mailData.dueDate).format("DD/MM/YYYY"),
                    amount: `${mailData?.amount - mailData?.amountPaid}`,
                },
                [RequestType.FORGOT_PASSWORD]:{
                    name: mailData.name,
                    subject:"A request to reset your password has been made!",
                    url: `${FRONTEND_URL}/reset-password/${mailData.otl}`,
                    template:"forgotPassword"
                },
            }[mailData.requestType];
        };

        const content = getContent()
        console.log("content", content);


        const emailTemplateSource = await fs.readFile(path.join(__dirname, `../shared/templates/${content?.template}.hbs`), "utf8");

        const mailgunAuth = {
            auth: {
                api_key: process.env.MAILGUN_API_KEY as string,
                domain: process.env.MAILGUN_DOMAIN as string,
            },
        };

        const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));
        const template = handlebars.compile(emailTemplateSource);

        const htmlToSend = template({
            year: new Date().getFullYear(),
            content,
            logo: "https://delegatecapturepro.pw/img/logo-shout.png",
        });


        const mailOptions = {
            from: `ShieldInvoice <invite@delegatecapturepro.pw>`,
            to: mailData?.email,
            subject: content?.subject,
            html: htmlToSend,
        };

        const info = await smtpTransport.sendMail(mailOptions);
        console.log(`Successfully sent email to ${mailData.email}.`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

export default sendEmail;

