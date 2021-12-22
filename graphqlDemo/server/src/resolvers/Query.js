import bcrypt from "bcryptjs";

const Query = {
  getFrames: async (parent, args, { Frame }, info) => {
    const frames = await Frame.find({}).sort({ start: 1 }).exec();
    console.log(frames);
    return frames;
  },
  getUsers: async (parent, args, { Account }, info) => {
    const users = await Account.find({});
    return users;
  },
};

export default Query;
