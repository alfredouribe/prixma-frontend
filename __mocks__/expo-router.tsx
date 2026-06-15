import React from 'react';

export const router = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
};

export const useRouter = jest.fn(() => router);

export const Redirect = jest.fn(({ href: _href }: { href: string }) => null);

const Stack = Object.assign(jest.fn(() => null), {
  Screen: jest.fn(() => null),
});
export { Stack };

export const Link = jest.fn(({ children }: { children: React.ReactNode }) => <>{children}</>);
