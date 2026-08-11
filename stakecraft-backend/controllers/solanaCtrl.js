import { getSolanaValidatorStats } from "../services/solanaValidatorStats.js";

export async function getValidatorStats(req, res) {
  try {
    const voteAccount = String(req.params.voteAccount || "").trim();
    const stats = await getSolanaValidatorStats(voteAccount);
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return res.status(200).json(stats);
  } catch (error) {
    const status = error?.status || 500;
    if (status >= 500) {
      console.error("Solana validator stats error:", error);
    }
    return res.status(status).json({
      error: status === 500 ? "Internal server error" : error.message,
    });
  }
}
