import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Inheritance", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployInheritanceFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, heir, otherAccount] = await ethers.getSigners();

    const currentTimestamp = await time.latest();

    const Inheritance = await ethers.getContractFactory("Inheritance");
    const inheritance = await Inheritance.deploy(heir);

    return { inheritance, owner, heir, otherAccount, currentTimestamp };
  }

  // Testing Deployment of Contract
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { inheritance, owner } = await loadFixture(
        deployInheritanceFixture
      );
      expect(await inheritance.owner()).to.equal(owner.address);
    });

    it("Should set the right heir", async function () {
      const { inheritance, heir } = await loadFixture(deployInheritanceFixture);
      expect(await inheritance.heir()).to.equal(heir.address);
    });

    it("Should set the right withdrawTime", async function () {
      const { inheritance, currentTimestamp } = await loadFixture(
        deployInheritanceFixture
      );
      expect(await inheritance.withdrawTime()).to.greaterThanOrEqual(
        currentTimestamp + 60 * 60 * 24 * 30
      );
    });
  });

  // Testing Deposit Function
  describe("Deposit", function () {
    it("Should increase contract balance with correct amount", async function () {
      const { inheritance, otherAccount } = await loadFixture(
        deployInheritanceFixture
      );

      await inheritance
        .connect(otherAccount)
        .deposit({ value: ethers.parseUnits("1", "ether") });

      expect(await ethers.provider.getBalance(inheritance.target)).to.equal(
        ethers.parseUnits("1", "ether")
      );
    });
  });

  // Testing Withdrawal Function
  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with You aren't the owner if called from another account", async function () {
        const { inheritance, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );

        await expect(
          inheritance.connect(otherAccount).withdraw(1)
        ).to.be.revertedWith("You aren't the owner");
      });
      it("Should revert with You can't withdraw more than the contract has", async function () {
        const { inheritance, owner, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );

        await expect(
          inheritance
            .connect(owner)
            .withdraw(
              (await ethers.provider.getBalance(inheritance.target)) +
                ethers.parseUnits("1", "ether")
            )
        ).to.be.revertedWith("You can't withdraw more than the contract has");
      });

      it("Should increase owner's and decrease contract's balance by correct amount", async function () {
        const { inheritance, owner, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );

        await inheritance
          .connect(otherAccount)
          .deposit({ value: ethers.parseUnits("2", "ether") });

        expect(
          await inheritance
            .connect(owner)
            .withdraw(ethers.parseUnits("2", "ether"))
        ).to.changeEtherBalances([inheritance, owner], [-2, 2]);
      });
    });

    describe("WithdrawalTime", function () {
      it("Should increase WithdrawalTime by 30 days if 0 eth withdrawed by owner", async function () {
        const { inheritance, owner } = await loadFixture(
          deployInheritanceFixture
        );
        const currentTimestamp = await time.latest();
        await inheritance.connect(owner).withdraw(0);
        expect(await inheritance.withdrawTime()).to.greaterThanOrEqual(
          currentTimestamp + 60 * 60 * 24 * 30
        );
      });

      it("Should increase WithdrawalTime by 30 days if non 0 amount withdrawed by owner", async function () {
        const { inheritance, owner, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );
        const currentTimestamp = await time.latest();
        await inheritance
          .connect(otherAccount)
          .deposit({ value: ethers.parseUnits("2", "ether") });
        await inheritance
          .connect(owner)
          .withdraw(ethers.parseUnits("1", "ether"));
        expect(await inheritance.withdrawTime()).to.greaterThanOrEqual(
          currentTimestamp + 60 * 60 * 24 * 30
        );
      });

      it("Should allow heir to become owner if owner doesn't withdraw for more than 30 days", async function () {
        const { inheritance, owner, heir, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );

        // advance time by one hour and mine a new block
        await time.increase(60 * 60 * 24 * 31);

        await inheritance.connect(heir).takeControl(otherAccount.address);

        expect(await inheritance.owner()).to.equal(heir.address);
      });
    });

    describe("TakeControl", function () {
      it("Should revert with You can't take control yet if withdrawal time is not passed", async function () {
        const { inheritance, owner, heir, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );
        await expect(
          inheritance.connect(heir).takeControl(otherAccount.address)
        ).to.be.revertedWith("You can't take control yet");
      });

      it("Should revert with You aren't the heir non heir trues to take control", async function () {
        const { inheritance, owner, heir, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );
        await expect(
          inheritance.connect(otherAccount).takeControl(owner.address)
        ).to.be.revertedWith("You aren't the heir");
      });

      it("Should increase withdrawal time by 30 days", async function () {
        const { inheritance, owner, heir } = await loadFixture(
          deployInheritanceFixture
        );
        const currentTimestamp = await time.latest();
        await time.increase(60 * 60 * 24 * 31);
        await inheritance.connect(heir).takeControl(owner.address);
        await expect(await inheritance.withdrawTime()).to.greaterThanOrEqual(
          currentTimestamp + 60 * 60 * 24 * 30
        );
      });

      it("Should allow heir to become owner and set new heir if owner doesn't withdraw for more than 30 days", async function () {
        const { inheritance, owner, heir, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );

        await time.increase(60 * 60 * 24 * 31);

        await inheritance.connect(heir).takeControl(otherAccount.address);

        expect(await inheritance.owner()).to.equal(heir.address);
        expect(await inheritance.heir()).to.equal(otherAccount.address);
      });

      it("Should revert with Owner can't be heir if heir sets self as heir", async function () {
        const { inheritance, owner, heir, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );

        // advance time by one hour and mine a new block
        await time.increase(60 * 60 * 24 * 31);
        await expect(
          inheritance.connect(heir).takeControl(heir.address)
        ).to.be.revertedWith("Owner can't be heir");
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { inheritance, owner, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );
        await inheritance
          .connect(otherAccount)
          .deposit({ value: ethers.parseUnits("1", "ether") });
        const amount = await ethers.provider.getBalance(inheritance.target);
        await expect(inheritance.connect(owner).withdraw(amount)).to.emit(
          inheritance,
          "Withdrawal"
        );
      });

      it("Should emit an event on WithdrawalTimeIncrease", async function () {
        const { inheritance, owner, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );
        await inheritance.connect(owner).withdraw(0);
        await expect(await inheritance.connect(owner).withdraw(0))
          .to.emit(inheritance, "WithdrawalTimeIncrease")
          .withArgs(await inheritance.withdrawTime());
      });

      it("Should emit an event on HeirChange", async function () {
        const { inheritance, owner, heir, otherAccount } = await loadFixture(
          deployInheritanceFixture
        );
        await time.increase(60 * 60 * 24 * 31);

        await expect(
          await inheritance.connect(heir).takeControl(otherAccount.address)
        )
          .to.emit(inheritance, "HeirChange")
          .withArgs(String(otherAccount.address));
      });
    });
  });
});
