import { AppsInToss } from '@apps-in-toss/framework';
import type { InitialProps } from '@granite-js/react-native';
import { context } from '../../require.context';
import { AppContainer } from './AppContainer';

export default AppsInToss.registerApp(AppContainer, { context });

export type { InitialProps };
