import { TDSProvider } from '@toss/tds-react-native';
import type { PropsWithChildren } from 'react';

export function AppContainer({ children }: PropsWithChildren) {
  return <TDSProvider>{children}</TDSProvider>;
}
