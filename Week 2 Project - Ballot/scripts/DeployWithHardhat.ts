import { viem } from "hardhat";
import { toHex, hexToString, formatEther } from "viem";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {
    const publicClient = await viem.getPublicClient();
    const blockNumber = await publicClient.getBlockNumber();
    console.log("Last block number:", blockNumber);
    const [deployer] = await viem.getWalletClients();
    console.log("Deployer address:", deployer.account.address);
    const balance = await publicClient.getBalance({
      address: deployer.account.address,
    });
    console.log(
      "Deployer balance:",
      formatEther(balance),
      deployer.chain.nativeCurrency.symbol
    );
    console.log("proposals:");
    PROPOSALS.forEach((element, index) => {
        console.log(`proposal N. ${index}: ${element}`);
    });

    console.log("\nDeploying Ballot contract");

    const ballotContract = await viem.deployContract("Ballot", [
        PROPOSALS.map((prop) => toHex(prop, { size: 32 })),
    ]);

    console.log("Ballot contract deployed to:", ballotContract.address);

    console.log("Proposals:");
    for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.read.proposals([BigInt(index)]);
        const name = hexToString(proposal[0], { size: 32 });
        console.log({ index, name, proposal });
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
