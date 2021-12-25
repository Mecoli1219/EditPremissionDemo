import mongoose from "mongoose";
const connectMongo = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((res) => console.log("mongodb connected"));
  const db = mongoose.connection;

  db.once("open", () => {
    console.log("Mongo database connected");
  });
  return db;
};

export default connectMongo;
