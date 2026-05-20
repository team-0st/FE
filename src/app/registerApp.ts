import { AppsInToss } from '@apps-in-toss/framework';
import { Granite, type InitialProps } from '@granite-js/react-native';
import { context } from '../../require.context';
import { AppContainer } from './AppContainer';
import { normalizeSchemeUrl } from './normalizeSchemeUrl';

const registerApp = Granite.registerApp.bind(Granite);

Granite.registerApp = (container, options) =>
  registerApp(container, {
    ...options,
    getInitialUrl: (initialScheme) => normalizeSchemeUrl(initialScheme),
  });

export default AppsInToss.registerApp(AppContainer, { context });

export type { InitialProps };
