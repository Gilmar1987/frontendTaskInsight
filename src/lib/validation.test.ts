/**
 * @jest-environment jsdom
 */

import { LoginSchema, SignupSchema, CreateTaskSchema, validateData } from './validation';

describe('Validation Schemas', () => {
  describe('LoginSchema', () => {
    it('deve validar login correto', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = LoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar senha muito curta', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('SignupSchema', () => {
    it('deve validar signup correto', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = SignupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar senhas não correspondentes', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      };

      const result = SignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar nome muito curto', () => {
      const invalidData = {
        name: 'T',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = SignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateTaskSchema', () => {
    it('deve validar tarefa correta', () => {
      const validData = {
        title: 'New Task',
        description: 'Task description here',
        priority: 'HIGH',
      };

      const result = CreateTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar título muito curto', () => {
      const invalidData = {
        title: 'T',
        description: 'Task description',
      };

      const result = CreateTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve permitir prioridade opcional', () => {
      const validData = {
        title: 'New Task',
        description: 'Task description here',
      };

      const result = CreateTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('validateData function', () => {
    it('deve retornar sucesso para dados válidos', async () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await validateData(LoginSchema, data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('deve retornar erros para dados inválidos', async () => {
      const data = {
        email: 'invalid',
        password: '123',
      };

      const result = await validateData(LoginSchema, data);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });
});
