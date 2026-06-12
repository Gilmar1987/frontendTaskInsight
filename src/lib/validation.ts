import { z } from "zod";

// Schemas de Autenticação
export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const SignupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não correspondem",
  path: ["confirmPassword"],
});

// Schemas de Tarefas
export const CreateTaskSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(200),
  description: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres").max(2000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().datetime().optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(5).max(2000).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().datetime().optional(),
});

// Tipos derivados dos schemas
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// Função auxiliar para validação
export const validateData = async <T>(schema: z.ZodSchema, data: unknown): Promise<{ success: boolean; data?: T; errors?: string[] }> => {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ["Erro ao validar dados"] };
  }
};
