import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

const Mutation = {
  login: async (parent, { name, password }, { Account }, info) => {
    const user = await Account.findOne({ name });
    if (!user) {
      // user with provided email not found
      return {
        ok: false,
        errors: [{ path: "name", message: "Wrong username" }],
      };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // bad password
      return {
        ok: false,
        errors: [{ path: "password", message: "Wrong password" }],
      };
    }

    return {
      ok: true,
    };
  },
  register: async (parent, { name, password }, { Account }) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await Account.create({
      id: uuidv4(),
      name,
      password: hashedPassword,
    });

    return {
      ok: true,
      user,
    };
  },
  addFrame: async (
    parent,
    { frame: { start, data, editing } },
    { Account, Frame }
  ) => {
    let processData = !data ? "" : data;
    let processEditing = !editing ? "" : editing;
    let cancelIndex = -1;

    if (editing !== "") {
      const prevEditing = await Frame.findOne({ editing });
      if (prevEditing) {
        cancelIndex = await Frame.find({
          start: { $lt: prevEditing.start },
        }).count();

        await Frame.findOneAndUpdate({ editing }, { editing: "" });
      }
    }

    const index = await Frame.find({ start: { $lt: start } }).count();
    // const frame = new Frame({ start, data: "", editing: user });
    const frame = await Frame.create({
      id: uuidv4(),
      start,
      data: processData,
      editing: processEditing,
    });

    if (cancelIndex < 0) {
      return {
        ok: true,
        index,
        frame,
      };
    } else {
      return {
        ok: true,
        index,
        cancelIndex,
        frame,
      };
    }
  },
  editRequest: async (
    parent,
    { request: { start, editing } },
    { Account, Frame }
  ) => {
    let processEditing = !editing ? "" : editing;
    let cancelIndex = -1;

    // if req editor != "" -> check prev Editing Frame
    if (processEditing !== "") {
      const prevEditing = await Frame.findOne({ editing: processEditing });
      if (prevEditing) {
        cancelIndex = await Frame.find({
          start: { $lt: prevEditing.start },
        }).count();

        await Frame.findOneAndUpdate(
          { editing: processEditing },
          { editing: "" }
        );
      }
    }

    // find editing frame index
    const index = await Frame.find({ start: { $lt: start } }).count();
    // const frame = new Frame({ start, data: "", editing: user });

    // check if the editing frame is edited by someone else
    const newEditing = await Frame.findOne({ start });
    if (newEditing.editing === editing || newEditing.editing === "") {
      // if not -> update editor
      await Frame.findOneAndUpdate({ start }, { editing });

      if (cancelIndex < 0) {
        return {
          ok: true,
          index,
        };
      } else {
        return {
          ok: true,
          index,
          cancelIndex,
        };
      }
    } else {
      return {
        ok: false,
        errors: [{ path: "editFrame", message: "someone is editing" }],
      };
    }
  },
  editFrame: async (parent, { frame: { start, data } }, { Account, Frame }) => {
    const index = await Frame.find({ start: { $lt: start } }).count();
    const frame = await Frame.findOneAndUpdate(
      { start },
      { data, editing: "" }
    );
    console.log(frame);
    return {
      ok: true,
      frame: { ...frame, id: frame._id, data: data },
      index,
    };
  },
  clearFrame: async (parent, _, { Account, Frame }) => {
    await Frame.deleteMany({});
    return {
      ok: true,
    };
  },
};

export default Mutation;
