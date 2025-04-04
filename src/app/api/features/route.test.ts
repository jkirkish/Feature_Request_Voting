import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    featureRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    vote: {
      create: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

describe('Features API', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: mockUser,
      expires: new Date().toISOString(),
    });
  });

  describe('POST /api/features', () => {
    it('should create a new feature request', async () => {
      const mockFeature = {
        id: '1',
        title: 'Test Feature',
        description: 'Test Description',
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        userId: mockUser.id,
        user: {
          name: 'Test User',
        },
      };

      (prisma.featureRequest.create as jest.Mock).mockResolvedValue(mockFeature);

      const request = new NextRequest('http://localhost:3000/api/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Feature',
          description: 'Test Description',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockFeature);
      expect(prisma.featureRequest.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Feature',
          description: 'Test Description',
          status: 'OPEN',
          userId: mockUser.id,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });
    });

    it('should return 401 for unauthenticated users', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Feature',
          description: 'Test Description',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Feature',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 500 if database operation fails', async () => {
      (prisma.featureRequest.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Feature',
          description: 'Test Description',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/features', () => {
    it('should return all feature requests', async () => {
      const mockFeatures = [
        {
          id: '1',
          title: 'Test Feature 1',
          description: 'Test Description 1',
          status: 'OPEN',
          createdAt: new Date().toISOString(),
          userId: mockUser.id,
          votes: [],
          user: {
            name: 'Test User',
          },
        },
        {
          id: '2',
          title: 'Test Feature 2',
          description: 'Test Description 2',
          status: 'OPEN',
          createdAt: new Date().toISOString(),
          userId: mockUser.id,
          votes: [],
          user: {
            name: 'Test User',
          },
        },
      ];

      (prisma.featureRequest.findMany as jest.Mock).mockResolvedValue(mockFeatures);

      const request = new NextRequest('http://localhost:3000/api/features');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockFeatures);
      expect(prisma.featureRequest.findMany).toHaveBeenCalledWith({
        include: {
          votes: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          votes: {
            _count: 'desc',
          },
        },
      });
    });

    it('should return 401 for unauthenticated users', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/features');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return 500 if database operation fails', async () => {
      (prisma.featureRequest.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/features');
      const response = await GET(request);
      expect(response.status).toBe(500);
    });
  });
}); 