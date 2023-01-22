const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  var operatorAddress = "0x88De931417d4bfB7571930C3060e74905A3C3cD1";
  var role = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("OPERATOR"));

  const ConvexLPToken = await hre.ethers.getContractFactory("ConvexLPToken");
  const convexLPToken = await ConvexLPToken.deploy(operatorAddress);

  await convexLPToken.deployed();
  console.log("ConvexLPToken deployed to:", convexLPToken.address);
  console.log(`Operator role ${operatorAddress}: `, await convexLPToken.hasRole(role, operatorAddress));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
