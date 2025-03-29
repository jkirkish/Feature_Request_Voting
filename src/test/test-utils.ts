import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
  },
};

export const mockAdminSession = {
  user: {
    id: 'test-admin-id',
    name: 'Test Admin',
    email: 'admin@example.com',
    role: 'ADMIN',
  },
};

export const createMockRequest = (method: string, body?: any): NextRequest => {
  return new NextRequest('http://localhost:3000/api/test', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const mockGetServerSession = (session: any = mockSession) => {
  (getServerSession as jest.Mock).mockResolvedValue(session);
};

export const mockPrismaError = (error: Error) => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  return error;
}; 