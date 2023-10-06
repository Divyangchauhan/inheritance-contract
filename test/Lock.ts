import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Inheritance", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployInheritanceFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Inheritance = await ethers.getContractFactory("Inheritance");
    const inheritance = await Inheritance.deploy();

    return { inheritance, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { inheritance, owner } = await loadFixture(
        deployInheritanceFixture
      );

      expect(await inheritance.owner()).to.equal(owner.address);
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called from another account", async function () {
        const { inheritance, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );

        // We use lock.connect() to send a transaction from another account
        await expect(
          inheritance.connect(otherAccount).withdraw()
        ).to.be.revertedWith("You aren't the owner");
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { inheritance, owner } = await loadFixture(
          deployInheritanceFixture
        );

        await expect(inheritance.withdraw()).to.emit(inheritance, "Withdrawal");
      });
    });
  });
});
