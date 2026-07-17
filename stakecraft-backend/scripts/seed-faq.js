import dotenv from "dotenv";
import mongoose from "mongoose";
import Faq from "../models/Faq.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/stakecraft";

const defaultFaqs = [
  {
    question: "How do I delegate to StakeCraft?",
    answer:
      "Choose a network on the StakeCraft homepage, open your wallet (Phantom for Solana, Keplr for Cosmos, NEAR Wallet for NEAR), go to staking, search for StakeCraft or paste our validator address, enter the amount, and confirm. Your tokens stay in your wallet.",
    order: 1,
    isActive: true,
  },
  {
    question: "Which networks does StakeCraft validate?",
    answer:
      "StakeCraft operates validators on Solana, NEAR, Kava, Polygon, and additional Cosmos ecosystem chains including Juno, Stargaze, and Band Protocol, plus Polkadot, Sui, and Walrus storage nodes. See the mainnet section on stakecraft.com for the full live list.",
    order: 2,
    isActive: true,
  },
  {
    question: "What commission does StakeCraft charge?",
    answer:
      "Commission rates vary by network and are set competitively within each ecosystem. Check the specific network validator page or wallet staking UI for the current commission rate before delegating.",
    order: 3,
    isActive: true,
  },
  {
    question: "Has StakeCraft ever been slashed?",
    answer:
      "StakeCraft has not been slashed on any network it operates. We prioritize security, monitoring, and redundant infrastructure to minimize slashing risk.",
    order: 4,
    isActive: true,
  },
  {
    question: "Is my stake safe? Does StakeCraft hold my tokens?",
    answer:
      "Delegated tokens remain in your own wallet at all times. StakeCraft is a non-custodial infrastructure operator and never takes possession of your assets. You retain full control and can undelegate according to each network's unbonding rules.",
    order: 5,
    isActive: true,
  },
];

async function seedFaq() {
  try {
    await mongoose.connect(MONGODB_URI);
    const existing = await Faq.countDocuments();
    if (existing > 0) {
      console.log(`FAQ already has ${existing} items, skipping seed`);
      process.exit(0);
    }

    await Faq.insertMany(defaultFaqs);
    console.log(`✅ Seeded ${defaultFaqs.length} FAQ items`);
    process.exit(0);
  } catch (error) {
    console.error("❌ FAQ seed failed:", error);
    process.exit(1);
  }
}

seedFaq();
