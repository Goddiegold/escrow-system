import { PrismaClient, payment_plan } from "@prisma/client";
import cron from "node-cron";
import { startOfDay } from "date-fns";

export default function (prisma: PrismaClient) {

    //deactivate users that thier plan as expired
    // cron.schedule('* * * * *', async function () {
    //     const currentDate = new Date()
    //     const startOfDaySpecificDate = startOfDay(currentDate);

    //     const users = await prisma.user.updateMany({
    //         where: {
    //             deactivated: false,
    //             nextPaymentDate: {
    //                 gte: startOfDaySpecificDate, // Greater than or equal to the start of the specificDate
    //                 lt: new Date(
    //                     startOfDaySpecificDate.getTime() + 24 * 60 * 60 * 1000,
    //                 ), // Less than the start of the next day
    //             }
    //         },
    //         data: {
    //             deactivated: true,
    //             currentPlan: payment_plan.noplan
    //         }
    //     })
    //     console.log("expired users updated", users.count);
    // })

}