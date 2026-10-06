import Express, { Request, Response } from "express";
import router from "./router.js";

const app = Express();

app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
