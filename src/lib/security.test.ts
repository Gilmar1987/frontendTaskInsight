/**
 * @jest-environment jsdom
 */

import * as SecurityManager from './security';

describe('SecurityManager', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    jest.clearAllMocks();
  });

  describe('Token Management', () => {
    it('deve salvar e recuperar token', () => {
      const token = 'test-token-12345';
      SecurityManager.setToken(token);

      const retrieved = SecurityManager.getToken();
      expect(retrieved).toBe(token);
    });

    it('deve limpar token', () => {
      SecurityManager.setToken('test-token');
      SecurityManager.clearToken();

      const retrieved = SecurityManager.getToken();
      expect(retrieved).toBeNull();
    });

    it('deve validar token válido', () => {
      SecurityManager.setToken('valid-token');
      expect(SecurityManager.isTokenValid()).toBe(true);
    });

    it('deve retornar false para token inválido', () => {
      SecurityManager.clearToken();
      expect(SecurityManager.isTokenValid()).toBe(false);
    });
  });

  describe('User Management', () => {
    it('deve salvar e recuperar usuário', () => {
      const user = {
        _id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      };

      SecurityManager.setUser(user);
      const retrieved = SecurityManager.getUser();

      expect(retrieved).toEqual(user);
    });

    it('deve limpar usuário', () => {
      SecurityManager.setUser({ name: 'Test' });
      SecurityManager.clearUser();

      const retrieved = SecurityManager.getUser();
      expect(retrieved).toBeNull();
    });
  });

  describe('Credentials Management', () => {
    it('deve limpar todas as credenciais', () => {
      SecurityManager.setToken('token');
      SecurityManager.setUser({ name: 'user' });

      SecurityManager.clearCredentials();

      expect(SecurityManager.getToken()).toBeNull();
      expect(SecurityManager.getUser()).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('deve lançar SecurityError com mensagem correta', () => {
      expect(() => {
        throw new SecurityManager.SecurityError('Test error');
      }).toThrow('Test error');
    });
  });
});
