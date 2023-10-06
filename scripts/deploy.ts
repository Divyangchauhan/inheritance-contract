import { ethers } from "hardhat";

async function main() {
  const inheritance = await ethers.deployContract("Inheritance");

  await inheritance.waitForDeployment();

  console.log(`Inheritance deployed to ${inheritance.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
