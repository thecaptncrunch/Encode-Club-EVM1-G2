import * as dotenv from "dotenv";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS as `0x${string}`;
const toAddress = process.env.TO_ADDRESS as `0x${string}`;

if (!contractAddress) {
  throw new Error("Contract address is not provided in .env file");
}

if (!toAddress) {
  throw new Error("You must provide the address to delegate the vote to via the TO_ADDRESS environment variable.");
}

if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
  throw new Error("Invalid address format");
}

async function main() {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  console.log(`Delegating vote to ${toAddress}...`);

  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: "delegate",
    args: [toAddress],
  });

  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Vote delegated in block:", receipt.blockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
