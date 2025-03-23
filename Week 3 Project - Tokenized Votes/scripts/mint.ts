import { viem } from "hardhat";
import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();

const deployerPrivateKey = process.env.PRIVATE_KEY ?? "";
const providerApiKey = process.env.ALCHEMY_API_KEY ?? "";
const MY_TOKEN_ADDRESS = process.env.DEPLOYED_CONTRACT_ADDRESS ?? "";
const MINT_AMOUNT = 1000n; 

async function main() {
    console.log("Minting tokens...");

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
        throw new Error("Please set MY_TOKEN_ADDRESS in your .env file");
    }

    const recipientAddress = deployer.account.address;

    try {

        const tokenContract = await viem.getContractAt("MyToken", MY_TOKEN_ADDRESS as `0x${string}`);
        
        console.log(`Token contract address: ${tokenContract.address}`);
        console.log(`Minter address: ${deployer.account.address}`);
        console.log(`Recipient address: ${recipientAddress}`);
        console.log(`Mint amount: ${MINT_AMOUNT} tokens`);

   
        const balanceBefore = await tokenContract.read.balanceOf([recipientAddress]);
        console.log(`Recipient balance before minting: ${balanceBefore} tokens`);


        const mintTx = await tokenContract.write.mint([recipientAddress, MINT_AMOUNT]);
        console.log(`Minting transaction hash: ${mintTx}`);
        

        const receipt = await publicClient.waitForTransactionReceipt({ hash: mintTx });
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        

        const balanceAfter = await tokenContract.read.balanceOf([recipientAddress]);
        console.log(`Recipient balance after minting: ${balanceAfter} tokens`);

        const votesBefore = await tokenContract.read.getVotes([recipientAddress]);
        console.log(`Recipient voting power before delegation: ${votesBefore}`);
    } catch (error) {
        console.error("Error minting tokens:", error);
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
