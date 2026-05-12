import { z } from 'zod';
export declare const CreateUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        MANAGER: "MANAGER";
        AGENT: "AGENT";
        CUSTOMER: "CUSTOMER";
    }>>;
}, z.core.$strip>;
export declare const UpdateUserSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const AssignRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        MANAGER: "MANAGER";
        AGENT: "AGENT";
        CUSTOMER: "CUSTOMER";
    }>;
}, z.core.$strip>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type AssignRoleInput = z.infer<typeof AssignRoleSchema>;
