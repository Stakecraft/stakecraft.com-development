import express from "express";
import netRouter from "./mainnet.js";

const app = express();
const router = express.Router();

app.use("/net", netRouter);

export default router;
