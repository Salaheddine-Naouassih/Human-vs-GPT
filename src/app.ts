import * as express from "express";
import { AppDataSource } from "./data-source";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { getConfig } from "./utils/config";
import { CustomRequest, authenticateToken } from "./middlewares/authMiddleware";
import { Response } from "express";
import { User } from "./entity/User";
import { joiBodyValidator, joiSignupSchema } from "./middlewares/Joi";

export const createApp = async () => {
  await AppDataSource.initialize();
  const userRepository = AppDataSource.getRepository(User);
  const app = express();
  app.use(express.json());

  app.get("/", (_req, res) => {
    AppDataSource.manager.find("User").then((users) => {
      res.send(users);
    });
  });

  app.post("/register", joiBodyValidator(joiSignupSchema), async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await userRepository.findOne({ where: { email } });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = AppDataSource.manager.create("User", {
      name,
      email,
      password: hashedPassword,
    });

    await AppDataSource.manager.save(user);
    res.json({ message: "User created" });
    console.log(user);
  });

  app.post("/login", async (req, res) => {
    const { ACCESS_TOKEN_SECRET } = getConfig();
    const { email, password } = req.body;
    console.log(email, password);
    const accessToken = jwt.sign({ email }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    res.json({ accessToken: accessToken });
  });

  app.get(
    "/hidden",
    authenticateToken,
    async (req: CustomRequest, res: Response) => {
      res.json({ email: req.user });
    }
  );

  return app;
};
