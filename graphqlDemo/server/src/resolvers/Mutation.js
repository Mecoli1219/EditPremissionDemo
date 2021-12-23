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
    console.log(hashedPassword);
    return {
      ok: true,
      user,
    };
  },
  addFrame: async (
    parent,
    { frame: { start, data, editing } },
    { Account, Frame, pubsub }
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

    pubsub.publish("frame", {
      frame: {
        mutation: "ADDED",
        addFrame: {
          ok: true,
          index,
          frame,
          cancelIndex,
        },
      },
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
    { Account, Frame, pubsub }
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
        pubsub.publish("frame", {
          frame: {
            mutation: "EDIT_REQUEST",
            editRequest: {
              ok: true,
              index,
              editing,
            },
          },
        });
        return {
          ok: true,
          index,
          editing,
        };
      } else {
        pubsub.publish("frame", {
          frame: {
            mutation: "EDIT_REQUEST",
            editRequest: {
              ok: true,
              index,
              cancelIndex,
              editing,
            },
          },
        });
        return {
          ok: true,
          index,
          cancelIndex,
          editing,
        };
      }
    } else {
      return {
        ok: false,
        errors: [{ path: "editFrame", message: "someone is editing" }],
      };
    }
  },
  editFrame: async (
    parent,
    { frame: { start, data } },
    { Account, Frame, pubsub }
  ) => {
    const index = await Frame.find({ start: { $lt: start } }).count();
    const frame = await Frame.findOneAndUpdate(
      { start },
      { data, editing: "" }
    );
    pubsub.publish("frame", {
      frame: {
        mutation: "EDITED_WITHOUT_SEQUENCE_CHANGE",
        editFrame: {
          ok: true,
          frame: { start: start, id: frame._id, data: data, editing: "" },
          index,
        },
      },
    });
    return {
      ok: true,
      frame: { ...frame, id: frame._id, data: data },
      index,
    };
  },
  clearFrame: async (parent, _, { Account, Frame, pubsub }) => {
    await Frame.deleteMany({});
    pubsub.publish("frame", {
      frame: {
        mutation: "CLEARED",
      },
    });
    return {
      ok: true,
    };
  },
  clearAccount: async (parent, _, { Account, Frame, pubsub }) => {
    await Account.deleteMany({});

    return {
      ok: true,
    };
  },
};

export default Mutation;
