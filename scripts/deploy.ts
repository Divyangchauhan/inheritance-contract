import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Make sure to edit this and add address of heir
  const heir = process.env.HeirAddress;

  if (!heir) {
    throw new Error("Please add HeirAddress to .env file");
  }

  console.log("\n Deploying contracts with the account:", deployer.address);

  const inheritance = await ethers.deployContract("Inheritance", [heir]);

  await inheritance.waitForDeployment();

  console.log(`Inheritance deployed to ${inheritance.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
