import Express, { Request, Response } from "express";
import router from "./router.js";
import cookieParser from "cookie-parser";

const app = Express();

// Parse cookies
app.use(cookieParser());

app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
