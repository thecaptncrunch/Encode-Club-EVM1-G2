import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { abi } from "../artifacts/contracts/MyToken.sol/MyToken.json"; 
dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS as `0x${string}`;

if (!contractAddress) {
  throw new Error("Contract address is not provided in .env file");
}

async function main() {
  const parameters = process.argv.slice(2);
  if (parameters.length < 1) {
    throw new Error("You must provide the address of the voter.");
  }

  const voterAddress = parameters[0] as `0x${string}`;
  if (!/^0x[a-fA-F0-9]{40}$/.test(voterAddress)) {
    throw new Error("Invalid voter address");
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

  const votes = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "getVotes",
    args: [voterAddress],
  }) as bigint;

  console.log(
    `Account ${voterAddress} has ${votes.toString()} units of voting power before self-delegating\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
