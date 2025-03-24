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

  const voterAddress = process.env.VOTER_ADDRESS;

  if (!voterAddress) {
    throw new Error("You must provide the address of the voter in the environment variable.");
  }

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
    `Account ${voterAddress} has ${votes.toString()} units of voting power\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
