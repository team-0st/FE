import { TDSProvider } from '@toss/tds-react-native';
import type { PropsWithChildren } from 'react';
import { UserProvider } from '../features/user/UserProvider';

export function AppContainer({ children }: PropsWithChildren) {
  return (
    <TDSProvider>
      <UserProvider>{children}</UserProvider>
    </TDSProvider>
  );
}
