import '@testing-library/jest-dom';

// Mock global Request object
global.Request = class Request {
  private _method: string;
  private _url: string;
  private _headers: Headers;
  private _body: any;

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    this._method = init?.method || 'GET';
    this._url = input.toString();
    this._headers = new Headers(init?.headers);
    this._body = init?.body;
  }

  get method() {
    return this._method;
  }

  get url() {
    return this._url;
  }

  get headers() {
    return this._headers;
  }

  get body() {
    return this._body;
  }

  async json() {
    return JSON.parse(this._body as string);
  }

  clone() {
    return new Request(this._url, {
      method: this._method,
      headers: this._headers,
      body: this._body,
    });
  }
} as any;

// Mock global Response object
global.Response = class Response {
  private _status: number;
  private _statusText: string;
  private _headers: Headers;
  private _body: any;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this._status = init?.status || 200;
    this._statusText = init?.statusText || 'OK';
    this._headers = new Headers(init?.headers);
    this._body = body;
  }

  get status() {
    return this._status;
  }

  get statusText() {
    return this._statusText;
  }

  get headers() {
    return this._headers;
  }

  get body() {
    return this._body;
  }

  json() {
    return Promise.resolve(JSON.parse(this._body as string));
  }

  clone() {
    return new Response(this._body, {
      status: this._status,
      statusText: this._statusText,
      headers: this._headers,
    });
  }
} as any;

// Mock NextRequest
jest.mock('next/server', () => ({
  NextRequest: class NextRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(input, init);
    }

    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body);
      }
      throw new Error('Body must be a string to parse as JSON');
    }
  },
  NextResponse: {
    json: (body: any, init?: ResponseInit) => new Response(JSON.stringify(body), init),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
    expires: new Date().toISOString(),
  })),
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
    expires: new Date().toISOString(),
  })),
}));

// Mock @auth/prisma-adapter
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({
    createUser: jest.fn(),
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    linkAccount: jest.fn(),
    unlinkAccount: jest.fn(),
    createSession: jest.fn(),
    getSessionAndUser: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    createVerificationToken: jest.fn(),
    useVerificationToken: jest.fn(),
    deleteVerificationToken: jest.fn(),
  })),
}));

// Mock prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    featureRequest: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    vote: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
  })),
}));

// Mock prisma instance
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    featureRequest: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    vote: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {
    adapter: {
      createUser: jest.fn(),
      getUser: jest.fn(),
      getUserByEmail: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      linkAccount: jest.fn(),
      unlinkAccount: jest.fn(),
      createSession: jest.fn(),
      getSessionAndUser: jest.fn(),
      updateSession: jest.fn(),
      deleteSession: jest.fn(),
      createVerificationToken: jest.fn(),
      useVerificationToken: jest.fn(),
      deleteVerificationToken: jest.fn(),
    },
    session: {
      strategy: 'jwt',
    },
    pages: {
      signIn: '/login',
    },
    providers: [],
    callbacks: {
      jwt: jest.fn(),
      session: jest.fn(),
    },
  },
})); 