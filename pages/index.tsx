import { createRoute } from '@granite-js/react-native';
import { HomeScreen } from '../src/features/home/HomeScreen';
import { ROUTES } from '../src/shared/constants/routes';

export const Route = createRoute('/', {
  component: Page,
});

function Page() {
  const navigation = Route.useNavigation();

  return (
    <HomeScreen
      onPressLogin={() => {
        navigation.navigate(ROUTES.login);
      }}
    />
  );
}
