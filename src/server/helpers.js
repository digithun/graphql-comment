const actionTriggerMiddleware = (actionType, triggerer) => ({rp, resolve, reject}, next) => {
  triggerer({
    type: actionType,
    payload: {
      args: rp.args,
    },
  });
  next();
};

/**
 * @param {resolverName} string - resolver name
 * @param {middleware} middleware - a callback which type ({rp: resolveParameter, resolve, reject}, next) => void
 * @return {Function} a enhance typeComposer
 */
const addResolverMiddleware = (resolverName, middleware) => (typeComposer) => {
  const resolver = typeComposer.getResolver(resolverName).wrapResolve(oldResolve => async rp => {
    return new Promise((resolve, reject) => {
      const next = async () => {
        const result = await oldResolve(rp);
        resolve(result);
        return result;
      };
      middleware({
        rp,
        resolve,
        reject,
      }, next);
    });
  }).clone({
    name: resolverName,
  });
  typeComposer.removeResolver(resolverName);
  typeComposer.addResolver(resolver);
  return typeComposer;
}

module.exports = {
  actionTriggerMiddleware,
  addResolverMiddleware,
};
