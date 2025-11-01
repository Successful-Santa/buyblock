import { expect } from "chai";
import { ethers } from "hardhat";
import { LandRegistryWithSig } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Addressable } from "ethers";

describe("LandRegistryWithSig", function () {
  let landRegistry: LandRegistryWithSig;
  let owner: SignerWithAddress;
  let registrar: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const TEST_GEOCID = "QmTest123";
  const TEST_DOCHASH = "0x" + "1".repeat(64);

  beforeEach(async function () {
    [owner, registrar, user1, user2] = await ethers.getSigners();
    
    const LandRegistry = await ethers.getContractFactory("LandRegistryWithSig");
    const deployedContract = await LandRegistry.deploy(registrar.address);
    await deployedContract.waitForDeployment();
    landRegistry = deployedContract as unknown as LandRegistryWithSig;
  });

  describe("Deployment", function () {
    it("Should set the right roles", async function () {
      const adminRole = await landRegistry.DEFAULT_ADMIN_ROLE();
      const registrarRole = await landRegistry.REGISTRAR_ROLE();
      
      expect(await landRegistry.hasRole(adminRole, owner.address)).to.be.true;
      expect(await landRegistry.hasRole(registrarRole, registrar.address)).to.be.true;
    });
  });

  describe("Parcel Registration", function () {
    it("Should allow registrar to register a parcel", async function () {
      await expect(landRegistry.connect(registrar).registerParcel(TEST_GEOCID, TEST_DOCHASH, user1.address))
        .to.emit(landRegistry, "ParcelRegistered")
        .withArgs(0, TEST_GEOCID, TEST_DOCHASH, user1.address);

      const parcel = await landRegistry.getParcel(0);
      expect(parcel[0]).to.equal(TEST_GEOCID);
      expect(parcel[1]).to.equal(TEST_DOCHASH);
      expect(parcel[2]).to.equal(user1.address);
    });

    it("Should not allow non-registrar to register a parcel", async function () {
      await expect(
        landRegistry.connect(user1).registerParcel(TEST_GEOCID, TEST_DOCHASH, user1.address)
      ).to.be.revertedWith("Not registrar");
    });
  });

  describe("Transfer Requests", function () {
    beforeEach(async function () {
      await landRegistry.connect(registrar).registerParcel(TEST_GEOCID, TEST_DOCHASH, user1.address);
    });

    it("Should allow owner to request transfer", async function () {
      await expect(landRegistry.connect(user1).requestTransfer(0, user2.address))
        .to.emit(landRegistry, "TransferRequested")
        .withArgs(0, 0, user1.address, user2.address);
    });

    it("Should not allow non-owner to request transfer", async function () {
      await expect(
        landRegistry.connect(user2).requestTransfer(0, user1.address)
      ).to.be.revertedWith("Not owner");
    });

    it("Should allow registrar to approve transfer", async function () {
      await landRegistry.connect(user1).requestTransfer(0, user2.address);
      
      await expect(landRegistry.connect(registrar).approveTransfer(0))
        .to.emit(landRegistry, "TransferApproved")
        .withArgs(0, 0, user1.address, user2.address)
        .and.to.emit(landRegistry, "OwnershipTransferred")
        .withArgs(0, user1.address, user2.address);

      const parcel = await landRegistry.getParcel(0);
      expect(parcel[2]).to.equal(user2.address);
    });
  });

  describe("Signed Transfers", function () {
    beforeEach(async function () {
      await landRegistry.connect(registrar).registerParcel(TEST_GEOCID, TEST_DOCHASH, user1.address);
    });

    it("Should execute transfer with valid signature", async function () {
      const parcelId = 0;
      const nonce = await landRegistry.getNonce(user1.address);
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      const domain = {
        name: "LandRegistry",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await landRegistry.getAddress()
      };

      const types = {
        Transfer: [
          { name: "parcelId", type: "uint256" },
          { name: "to", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ]
      };

      const value = {
        parcelId: parcelId,
        to: user2.address,
        nonce: nonce,
        deadline: deadline
      };

      const signature = await user1.signTypedData(domain, types, value);

      await expect(
        landRegistry.connect(registrar).executeTransferWithSig(
          parcelId,
          user2.address,
          nonce,
          deadline,
          signature
        )
      )
        .to.emit(landRegistry, "SignedTransferExecuted")
        .withArgs(parcelId, user1.address, user2.address, nonce)
        .and.to.emit(landRegistry, "OwnershipTransferred")
        .withArgs(parcelId, user1.address, user2.address);

      const parcel = await landRegistry.getParcel(parcelId);
      expect(parcel[2]).to.equal(user2.address);
    });

    it("Should not execute transfer with expired signature", async function () {
      const parcelId = 0;
      const nonce = await landRegistry.getNonce(user1.address);
      const deadline = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      const domain = {
        name: "LandRegistry",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await landRegistry.getAddress()
      };

      const types = {
        Transfer: [
          { name: "parcelId", type: "uint256" },
          { name: "to", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ]
      };

      const value = {
        parcelId: parcelId,
        to: user2.address,
        nonce: nonce,
        deadline: deadline
      };

      const signature = await user1.signTypedData(domain, types, value);

      await expect(
        landRegistry.connect(registrar).executeTransferWithSig(
          parcelId,
          user2.address,
          nonce,
          deadline,
          signature
        )
      ).to.be.revertedWith("Signature expired");
    });
  });
});