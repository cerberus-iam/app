import type { NextPage } from 'next';
import type { ReactElement } from 'react';

export type NextPageWithLayout<P = object> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactElement;
};
