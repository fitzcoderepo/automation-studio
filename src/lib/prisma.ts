import { PrismaClient } from "@prisma/client";

// This file helps to avoid having to create mult db connections during dev.
// Its a single and reusable prisma instance.
// Available anywhere in the app.


const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;

};



export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["query"], });



if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
