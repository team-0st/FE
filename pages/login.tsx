import { createRoute } from '@granite-js/react-native';
import { LoginScreen } from '../src/features/login/LoginScreen';
import { ROUTES } from '../src/shared/constants/routes';

export const Route = createRoute('/login', {
  component: Page,
});

function Page() {
  const navigation = Route.useNavigation();

  return (
    <LoginScreen
      onPressBack={() => {
        navigation.navigate(ROUTES.home);
      }}
    />
  );
}
