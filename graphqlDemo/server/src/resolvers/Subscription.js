const Subscription = {
  frame: {
    subscribe(parent, _, { db, pubsub }, info) {
      return pubsub.asyncIterator("frame");
    },
  },
};

export { Subscription as default };
