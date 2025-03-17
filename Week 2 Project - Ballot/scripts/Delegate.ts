import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  if (parameters.length < 2) {
    throw new Error("You must provide the address to delegate to and the contract address.");
  }

  const toAddress = parameters[0] as `0x${string}`;
  const contractAddress = parameters[1] as `0x${string}`;

  if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress) || !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new Error("Invalid address format");
  }

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
