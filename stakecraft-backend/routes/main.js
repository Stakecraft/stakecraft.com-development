import netRouter from "./mainnet.js";

// Kept as an alias of the mainnet router. Do not create a second Express
// application here — Helmet and the rest of the stack live on server.js.
export default netRouter;
