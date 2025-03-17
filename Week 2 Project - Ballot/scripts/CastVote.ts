import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import * as dotenv from "dotenv";
import { hexToString } from "viem/utils";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  if (parameters.length < 2) {
    throw new Error("You must provide a contract address and a proposal index.");
  }

  const contractAddress = parameters[0] as `0x${string}`;
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const proposalIndex = BigInt(parameters[1]);
  if (isNaN(Number(proposalIndex))) {
    throw new Error("Invalid proposal index");
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


  console.log("Fetching proposal...");
  const proposal = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "proposals",
    args: [proposalIndex],
  })) as any[];

  const proposalName = hexToString(proposal[0], { size: 32 });
  console.log(`You are voting for proposal: ${proposalName}`);
  console.log("Confirm? (Y/n)");


  const stdin = process.stdin;
  stdin.addListener("data", async function (d) {
    if (d.toString().trim().toLowerCase() !== "n") {
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
    } else {
      console.log("Operation cancelled");
    }
    process.exit();
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
