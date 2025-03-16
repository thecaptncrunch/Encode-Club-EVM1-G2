import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const contractAddress = "0xfc556f798a553fefd99014d936da7dc6d0addaa2";

async function main() {
  const parameters = process.argv.slice(2);
  if (parameters.length < 2) {
    throw new Error("You must provide a voter address and a proposal index.");
  }

  const voterAddress = parameters[0];
  const proposalIndex = BigInt(parameters[1]);

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

  console.log("Casting vote...");
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: "vote",
    args: [proposalIndex],
  });

  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Vote confirmed in block:", receipt.blockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
