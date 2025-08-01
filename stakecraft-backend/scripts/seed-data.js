import mongoose from "mongoose";
import dotenv from "dotenv";
import Content from "../models/Content.js";

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/stakecraft";

// Sample mainnet networks data
const mainnetNetworks = [
  {
    type: "mainnet",
    title: "Solana",
    description:
      "Public base-layer blockchain protocol that optimizes for scalability. Its goal is to provide a platform that enables developers to create decentralized applications (dApps) without needing to design around performance bottlenecks.",
    stakeCode: "BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g",
    link: "https://stakewiz.com/validator/BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g",
    order: 1,
    isActive: true,
    metadata: {
      howToStake:
        "https://medium.com/coinmonks/how-to-stake-sol-with-solflare-wallet-f2b844e8c379",
    },
  },
  {
    type: "mainnet",
    title: "Near Protocol",
    description:
      "NEAR is the chain abstraction stack, empowering builders to create apps that scale to billions of users and across all blockchains.",
    stakeCode: "stakecraft.poolv1.near",
    link: "https://nearscope.net/validator/stakecraft.poolv1.near/tab/dashboard",
    order: 2,
    isActive: true,
  },
  {
    type: "mainnet",
    title: "Kava",
    description:
      "The most trusted DeFi platform by financial institutions providing securely access a robust suite of DeFi products and services in one safe and seamless integration.",
    stakeCode: "kavavaloper1k760ypy9tzhp6l2rmg06sq4n74z0d3rejwwaa0",
    link: "https://www.mintscan.io/kava/validators/kavavaloper1k760ypy9tzhp6l2rmg06sq4n74z0d3rejwwaa0",
    order: 3,
    isActive: true,
    metadata: {
      howToStake:
        "https://medium.com/coinmonks/staking-your-kava-tokens-with-keplr-wallet-19f74e384e5a",
    },
  },
  {
    type: "mainnet",
    title: "Polygon",
    description:
      "Polygon (MATIC) is a layer 2 scaling solution for Ethereum that aims to enhance scalability and improve user experience by providing faster and cheaper transactions.",
    stakeCode: "0x6215CF116c6a96872486cDC7cb50f52e515cCD15",
    link: "https://staking.polygon.technology/validators/155",
    order: 4,
    isActive: true,
  },
];

// Sample testnet networks data
const testnetNetworks = [
  {
    type: "testnet",
    title: "Monad",
    description:
      "Monad is a high-performance Layer 1 blockchain that delivers 10,000 TPS with full EVM compatibility. Built for scalability without compromising decentralization, Monad enables the next generation of DeFi applications.",
    order: 1,
    isActive: true,
  },
  {
    type: "testnet",
    title: "Aztec",
    description:
      "Aztec is a privacy-first Layer 2 network built on Ethereum. It enables private DeFi with zero-knowledge proofs, allowing users to transact with complete privacy while maintaining full compatibility with Ethereum.",
    order: 2,
    isActive: true,
  },
  {
    type: "testnet",
    title: "Nexus",
    description:
      "Nexus is a decentralized protocol for creating and trading synthetic assets. It provides a comprehensive platform for synthetic asset creation, enabling users to gain exposure to any asset class through blockchain technology.",
    order: 3,
    isActive: true,
  },
];

// Sample partnerships data
const partnerships = [
  {
    type: "partnership",
    title: "Q Protocol",
    description: "Q Protocol partnership for blockchain infrastructure",
    order: 1,
    isActive: true,
    partnership: {
      name: "Q Protocol",
      description: "Blockchain infrastructure partnership",
      website: "https://q.org",
    },
  },
  {
    type: "partnership",
    title: "Polygon",
    description: "Polygon scaling solution partnership",
    order: 2,
    isActive: true,
    partnership: {
      name: "Polygon",
      description: "Layer 2 scaling partnership",
      website: "https://polygon.technology",
    },
  },
];

// Sample about content
const aboutContent = [
  {
    type: "about",
    title: "Quality Environment & Security",
    description:
      "We use the latest infrastructure/hardware and our network is located within state of the art data centre facilities.",
    order: 1,
    isActive: true,
  },
  {
    type: "about",
    title: "Publicity",
    description:
      "Anyone can follow all our operations. Our activity is open to users. We believe this is the way it should be done.",
    order: 2,
    isActive: true,
  },
  {
    type: "about",
    title: "Technical Support",
    description:
      "We focus on providing our clients with support to solve problems and keep their business running smoothly.",
    order: 3,
    isActive: true,
  },
];

// Sample team members
const teamMembers = [
  {
    type: "team",
    title: "Vasily Istomin",
    description:
      "Project manager, business analysis, business planning, and customer relations. Crypto enthusiast.",
    order: 1,
    isActive: true,
    teamMember: {
      name: "Vasily Istomin",
      position: "Project Manager",
      bio: "Project manager, business analysis, business planning, and customer relations. Crypto enthusiast.",
      socialLinks: {
        linkedin: "https://linkedin.com/in/vasily-istomin",
        twitter: "https://twitter.com/vasily_istomin",
      },
    },
  },
  {
    type: "team",
    title: "Alexander Lysenko",
    description:
      "CEO at Hubcap SRL. Over 15 years of UNIX software system administration and DevOps experience.",
    order: 2,
    isActive: true,
    teamMember: {
      name: "Alexander Lysenko",
      position: "CEO",
      bio: "CEO at Hubcap SRL. Over 15 years of UNIX software system administration and DevOps experience.",
      socialLinks: {
        linkedin: "https://linkedin.com/in/alexander-lysenko",
        github: "https://github.com/alexander-lysenko",
      },
    },
  },
];

// Connect to database and seed data
async function seedData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing content
    console.log("Clearing existing content...");
    await Content.deleteMany({});

    // Insert mainnet networks
    console.log("Inserting mainnet networks...");
    await Content.insertMany(mainnetNetworks);

    // Insert testnet networks
    console.log("Inserting testnet networks...");
    await Content.insertMany(testnetNetworks);

    // Insert partnerships
    console.log("Inserting partnerships...");
    await Content.insertMany(partnerships);

    // Insert about content
    console.log("Inserting about content...");
    await Content.insertMany(aboutContent);

    // Insert team members
    console.log("Inserting team members...");
    await Content.insertMany(teamMembers);

    console.log("✅ Database seeded successfully!");
    console.log(
      `📊 Total records created: ${
        mainnetNetworks.length +
        testnetNetworks.length +
        partnerships.length +
        aboutContent.length +
        teamMembers.length
      }`
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seed function
seedData();
