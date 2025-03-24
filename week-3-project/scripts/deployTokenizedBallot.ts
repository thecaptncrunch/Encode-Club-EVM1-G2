import { viem } from "hardhat";
import { createPublicClient, http, createWalletClient, stringToHex, pad } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY ?? "";
const deployerPrivateKey = process.env.PRIVATE_KEY ?? "";
const MY_TOKEN_ADDRESS = "0x46E36DA8B60F5ae809488F2fa9D8402948E1369E";

function convertStringToBytes32(input: string): `0x${string}` {
    return pad(stringToHex(input), { dir: 'right' });
}

async function main() {
    console.log("Deploying TokenizedBallot contract...");

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });
    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const deployer = createWalletClient({
        account,
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });

    if (!MY_TOKEN_ADDRESS) {
        throw new Error("Please set TOKEN_CONTRACT_ADDRESS in your .env file");
    }
    console.log(`Token contract address: ${MY_TOKEN_ADDRESS}`);
    console.log(`Deployer address: ${deployer.account.address}`);


    const currentBlock = await publicClient.getBlockNumber();

    const targetBlockNumber = Number(currentBlock) - 100;
    console.log(`Current block number: ${currentBlock}`);
    console.log(`Target block number: ${targetBlockNumber}`);

 
    const proposals = ["Proposal 1", "Proposal 2", "Proposal 3"];
    console.log("Proposals:", proposals);
   
    const proposalBytes32 = proposals.map(proposal => {
        return `0x${Buffer.from(proposal).toString('hex').padEnd(64, '0')}`;
    });
    console.log("Proposals in bytes32:", proposalBytes32);

    try {
        console.log("Attempting to deploy with parameters:");
        console.log("- Proposals:", proposalBytes32);
        console.log("- Token Contract:", MY_TOKEN_ADDRESS);
        console.log("- Target Block Number:", targetBlockNumber);
        
        const deployTx = await deployer.deployContract({
            abi: (await import("../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json")).abi,
            bytecode: (await import("../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json")).bytecode as `0x${string}`,
            args: [proposalBytes32, MY_TOKEN_ADDRESS, targetBlockNumber]
        });
        
        console.log(`Deployment transaction hash: ${deployTx}`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash: deployTx });
        
        if (receipt?.contractAddress) {
        console.log(`TokenizedBallot deployed to: ${receipt.contractAddress}`);
        console.log(`Add this to your .env file: TOKENIZED_BALLOT_ADDRESS=${receipt.contractAddress}`);
        

        const tokenizedBallot = await viem.getContractAt("TokenizedBallot", receipt.contractAddress);
        
        console.log("\nVerifying deployment...");
        const tokenContract = await tokenizedBallot.read.tokenContract();
        console.log(`Token contract address: ${tokenContract}`);
        
        const deployedTargetBlock = await tokenizedBallot.read.targetBlockNumber();
        console.log(`Target block number: ${deployedTargetBlock}`);
        
 
        for (let i = 0; i < proposals.length; i++) {
            try {
            const proposal = await tokenizedBallot.read.proposals([BigInt(i)]);
            console.log(`Proposal ${i}: ${proposals[i]}, Vote Count: ${proposal[1]}`);
            } catch (error) {
            console.error(`Error reading proposal ${i}:`, error);
            }
        }
        } else {
        console.error("Failed to deploy contract - no contract address in receipt");
        }
    } catch (error) {
        console.error("Error deploying TokenizedBallot contract:");
        if (error instanceof Error) {
        console.error(error.message);
        } else {
        console.error(String(error));
        }
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

//contract address: 0xa46d28af13b4e8f77b3865e0cb65dbf44e6142fb