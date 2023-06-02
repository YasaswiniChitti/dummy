import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import usersRoute from "./routes/users";
import cors from "cors";
import mongoose, { connection, connect } from "mongoose";
import jwt from "jsonwebtoken";
import User from "./model/user";
import bcrypt, { compare } from "bcryptjs";

dotenv.config();

const app: Express = express();
const DB_USER = process.env.DB_NAME;
const PASSWORD = process.env.DB_PASSWORD;
const url = `mongodb+srv://${DB_USER}:${PASSWORD}@cluster0.ugapn4q.mongodb.net/?retryWrites=true&w=majority`;
connection
  .on("error", console.log)
  .on("disconnected", () => {
    // reconnect to mongodb
    connect(url);
  })
  .once("open", () => {
    app.listen(process.env.PORT, () => {
      console.log("App is listening on port 3005!");
    });
  });

// connect to mongodb
connect(url);
app.use(cors());
app.use(express.json());

app.use("/users", usersRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/login", async (req: Request, res: Response) => {
  // if (!req.headers.authorization) {
  //   return res.status(400).json("authorization header is not present.");
  // }
  // const [authType, authData] = req.headers.authorization.split(" ");
  // if (authType !== "Basic") {
  //   return res.sendStatus(400);
  // }
  // const data = atob(authData);
  // const [email, password] = data.split(":");
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log(user);

  if (user === null || (await bcrypt.compare(password, user.password))) {
    return res.status(400).json("The Email / Password is incorrect.");
  }
  res.json(
    jwt.sign(
      {
        sub: user._id.toString(),
        alg: "HS256",
      },
      process.env.JWT_SECRET!
    )
  );
});
app.post("/register", async (req: Request, res: Response) => {
  if (await User.exists({ email: req.body.email })) {
    return res.status(400).json("This email address is already taken.");
  }
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hash(req.body.password, 10),
  });

  res.json(
    jwt.sign(
      {
        sub: user._id.toString(),
        alg: "HS256",
      },
      process.env.JWT_SECRET!
    )
  );
});

app.get("/test", (req: Request, res: Response) => {
  res.send("working");
});
