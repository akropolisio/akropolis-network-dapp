import build, { getParam } from 'shared/helpers/buildRouteTree';

const rawTree = {
  marketplace: null,
  cashFlows: {
    type: getParam(null),
  },
  create: null,
  daoName: getParam({
    home: null,
    appName: getParam(null),
  }),
};

const routes = build(rawTree);

export default routes;
