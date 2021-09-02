const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require("./config/config");
const express = require("express");
const mongoose = require("mongoose");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const redis = require("redis");
const connectRedis = require("connect-redis");
const session = require("express-session");

const app = express();

mongoose
  .connect(
    `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}?authSource=admin`,
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("Mongodb connected"))
  .catch((e) => console.log(e));

let RedisStore = connectRedis(session);

let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

redisClient.on("error", function (err) {
  console.log("Could not establish a connection with redis. " + err);
});
redisClient.on("connect", function (err) {
  console.log("Connected to redis successfully");
});

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    saveUninitialized: false,
    secret: SESSION_SECRET,
    resave: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 60000,
    },
  })
);

app.enable("trust proxy");
app.use(express.json());
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);
app.get("/api/v1", (req, res) => {
  res.send("<h2>Hello world</h2>");
  console.log("Runs");
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
