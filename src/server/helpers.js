const actionTriggerMiddleware = (actionType, triggerer) => ({rp, resolve, reject}, next) => {
  triggerer({
    type: actionType,
    payload: {
      args: rp.args,
    },
  });
  next();
};

module.exports = {
  actionTriggerMiddleware,
};
