import dotenv from "dotenv";
import { ethers } from "hardhat";
dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contract with the address: ${deployer.address}`);

    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy();

    await myToken.waitForDeployment();
    console.log(`Contract MyToken deploy in: ${await myToken.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


//contract address: 0x46E36DA8B60F5ae809488F2fa9D8402948E1369E