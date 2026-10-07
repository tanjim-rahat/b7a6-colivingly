import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const readSuccessPage = (): string => {
  return fs.readFileSync(path.join(__dirname, "../../public/success.html"), "utf-8");
};
