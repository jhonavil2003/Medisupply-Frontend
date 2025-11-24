import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    display: 'none',
    appearance: ['-webkit-appearance']
  })
});

// Mock de CSS.supports
Object.defineProperty(window, 'CSS', {
  value: {
    supports: jest.fn().mockReturnValue(false),
    escape: (str: string) => str
  }
});

// Suprimir warnings de console específicos si es necesario
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn((message) => {
    // Filtrar warnings específicos que queramos ignorar
    if (message.includes('Angular Material')) return;
    if (message.includes('NG0505')) return; // Angular hydration warning
    if (message.includes('Angular hydration')) return;
    originalWarn(message);
  });

  console.error = jest.fn((message) => {
    // Filtrar errores específicos que queramos ignorar
    const messageStr = typeof message === 'string' ? message : String(message);
    if (messageStr.includes('Navigation')) return;
    originalError(message);
  });
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
