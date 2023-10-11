import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Make sure to edit this and add address of heir
  const heir = "";

  if (heir === "") {
    throw new Error("Please add heir address to scripts/deploy.ts");
  }

  console.log("\n Deploying contracts with the account:", deployer.address);

  console.log(
    "\n Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

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
