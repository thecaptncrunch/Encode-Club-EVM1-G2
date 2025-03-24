import { sepolia } from "viem/chains";
import { createPublicClient, http } from "viem";
import { abi } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployedContract = process.env.DEPLOYED_CONTRACT_ADDRESS || "";

async function main() {
// Connects to the Sepolia blockchain
    const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });

    const contractAddress = deployedContract as `0x${string}`;
    const winningProposalName = await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: "winnerName"
        });
    console.log("The winning proposal is:", winningProposalName);
    const winningProposal = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "winningProposal"
    });
    console.log("Here are the details of the winning proposal:", winningProposal);
  }

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });