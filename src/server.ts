import Express, { Request, Response } from "express";
import router from "./router.js";
import cookieParser from "cookie-parser";
import { readSuccessPage } from "./modules/payment/payment.utils.js";

const app = Express();

// Parse cookies
app.use(cookieParser());

app.use("/api", router);

app.get("/payment/success", (_req: Request, res: Response) => {
  res.send(readSuccessPage());
});

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to colively API");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
