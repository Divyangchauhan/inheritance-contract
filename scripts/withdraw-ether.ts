import { ethers } from "hardhat";
import "dotenv/config";

import inheritanceAbi from "../artifacts/contracts/Inheritance.sol/Inheritance.json";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.JsonRpcProvider);
  const signer = await provider.getSigner(0);
  const contract = new ethers.Contract(
    process.env.ContractAddress!,
    inheritanceAbi.abi,
    signer
  );

  console.log(
    `owner balance is ${await provider.getBalance(signer.getAddress())}`
  );
  console.log(`owner address is  ${await signer.getAddress()}`);

  console.log(`contract address is ${await contract.owner()}`);
  console.log(`Contract balance ${await provider.getBalance(contract.target)}`);

  await contract.withdraw();

  await new Promise((r) => setTimeout(r, 5000));

  console.log(
    `owner balance ${await provider.getBalance(signer.getAddress())}`
  );

  console.log(`Contract balance ${await provider.getBalance(contract.target)}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
