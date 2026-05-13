import { z } from 'zod';

export const CreatePermissionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
  level: z.number().int().min(0).max(3),
});

export const UpdatePermissionSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  resource: z.string().min(1).optional(),
  action: z.string().min(1).optional(),
  level: z.number().int().min(0).max(3).optional(),
  isActive: z.boolean().optional(),
});

export type CreatePermissionInput = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof UpdatePermissionSchema>;
