import { createRoute } from '@granite-js/react-native';
import { AdminReviewScreen } from '../../src/features/profile/AdminReviewScreen';

export const Route = createRoute('/admin/review', {
    component: Page,
});

function Page() {
    return <AdminReviewScreen />;
}
