const actionTriggerMiddleware = (actionType, triggerer) => ({rp, resolve, reject}, next) => {
  triggerer({
    type: actionType,
    payload: {
      args: rp.args,
    },
  });
  next();
};

async function getUserRefFromContext(context) {
  if (context.nap.currentUser) {
    return context.nap.currentUser.userId;
  }
  return null;
}

module.exports = {
  actionTriggerMiddleware,
  getUserRefFromContext,
};
