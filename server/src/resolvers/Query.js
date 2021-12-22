import bcrypt from "bcryptjs";

const Query = {
  getFrames: async (parent, args, { Frame }, info) => {
    const frames = await Frame.find({});
    return frames;
  },
  getUsers: async (parent, args, { Account }, info) => {
    const users = await Account.find({});
    return users;
  },
};

export default Query;
