const { ethers } = require("hardhat")

async function main() {
  const Vaults = await ethers.getContractFactory("Vaults");

  const vaults = await Vaults.deploy();

  console.log("Vaults deployed to:", vaults.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
