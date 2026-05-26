import { createRoute } from '@granite-js/react-native';
import { useEffect } from 'react';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/shop', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();

    useEffect(() => {
        navigation.replace(ROUTES.home);
    }, [navigation]);

    return null;
}
