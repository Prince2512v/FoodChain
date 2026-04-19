const hre = require("hardhat");

async function main() {
  console.log("Compiling contracts...");
  await hre.run("compile");

  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  console.log("Deploying SupplyChain...");
  const supplyChain = await SupplyChain.deploy();

  await supplyChain.waitForDeployment();
  const address = await supplyChain.getAddress();

  console.log("-----------------------------------------");
  console.log("SupplyChain deployed to:", address);
  console.log("CONTRACT_ADDRESS: " + address);
  console.log("PRIVATE_KEY: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("-----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
