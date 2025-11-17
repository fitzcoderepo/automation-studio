import { PrismaClient } from "@prisma/client";

// This file helps to avoid having to create mult db connections during dev.
// Its a single and reusable prisma instance.
// Available anywhere in the app.


const globalForPrisma = globalThis as unknows as {
    prisma: PrismaClient | udefined;

};



export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["query"], });



if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
