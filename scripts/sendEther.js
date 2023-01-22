// run 'npx hardhat run ./scripts/sendEther.js --network tenderly' to send ethers to specific account

const hre = require("hardhat");

const WALLETS = [
    "0x15dE3776e85Ac25dd17a85b44f3d9c75f2bBC4b7",
];

async function main() {
    const result = await ethers.provider.send("tenderly_addBalance", [
        WALLETS,
        //amount in wei will be added for all wallets
        ethers.utils.hexValue(ethers.utils.parseUnits("20", "ether").toHexString()),
    ]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
