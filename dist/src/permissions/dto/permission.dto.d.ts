import { z } from 'zod';
export declare const CreatePermissionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    resource: z.ZodString;
    action: z.ZodString;
    level: z.ZodNumber;
}, z.core.$strip>;
export declare const UpdatePermissionSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    resource: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    level: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreatePermissionInput = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof UpdatePermissionSchema>;
