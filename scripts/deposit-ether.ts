import { ethers } from "hardhat";
import "dotenv/config";

import inheritanceAbi from "../artifacts/contracts/Inheritance.sol/Inheritance.json";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.JsonRpcProvider);
  const signer = await provider.getSigner(1);
  const contract = new ethers.Contract(
    process.env.ContractAddress!,
    inheritanceAbi.abi,
    signer
  );

  await contract.deposit({ value: ethers.parseUnits("1", "ether") });

  await new Promise((r) => setTimeout(r, 5000));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
