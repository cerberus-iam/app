'use client';

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps as NextThemeProviderProps,
} from 'next-themes';
import { type ReactNode } from 'react';

type ThemeProviderProps = {
  children: ReactNode;
  attribute?: NextThemeProviderProps['attribute'];
};

export function ThemeProvider({ children, attribute = 'class' }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
