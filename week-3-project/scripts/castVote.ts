import { sepolia } from "viem/chains";
import { createPublicClient, http, createWalletClient , hexToString } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const deployedContract = process.env.DEPLOYED_CONTRACT_ADDRESS || "";

async function main() {
// Sets up the proposal parameters
// Expects 1 parameter in the form of a string declaring the proposal
  const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 2)
    throw new Error("Parameters not provided");

  const proposalIndex = parameters[0];
    if (isNaN(Number(proposalIndex))) throw new Error("Invalid proposal index");

  const votesProvided = BigInt(parameters[1]);
    if (votesProvided < 1) throw new Error("Not enough votes provided")

// Connects to the Sepolia blockchain
    const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });

// Connects and allows interaction with the specified account
    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const wallet = createWalletClient({
      account,
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });

    console.log("Proposal selected: ", parameters[0]);
    const contractAddress = deployedContract as `0x${string}`;
    console.log("Deployed contract address is:", contractAddress);

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.on('line', async function (d: Buffer) {
      if (d.toString().trim().toLowerCase() != "n") {
        const hash = await wallet.writeContract({
          address: contractAddress,
          abi,
          functionName: "vote",
          args: [parameters[0], parameters[1]],
        });
        console.log("Transaction hash:", hash);
        console.log("Waiting for confirmations...");
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log("Receipt information:", receipt);
        console.log("Transaction confirmed");
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

  // This script reverted due to issues with the parameters. We were unable to resolve. 