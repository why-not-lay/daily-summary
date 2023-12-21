import { RouteConfig } from "../routers";
import { LVPair } from "../types/common";

const serializePaths = (routes: RouteConfig[]) => {
  const paths: LVPair<string>[] = [];
  routes.forEach(route => {
    const { path, children, label = '' } = route;
    if(children instanceof Array) {
      const childrenPaths = serializePaths(children);
      childrenPaths.forEach(childPath => {
        const { label, value } = childPath;
        paths.push({
          label,
          value: `/${path}/${value}`.replaceAll(/\/+/g, '/'),
        });
      });
    } else {
      if(typeof path === 'string') {
        paths.push({
          label,
          value: path,
        });
      }
    }
  });
  return paths;
}

export {
  serializePaths,
}