import hre from "hardhat";

async function main() {
    console.log("Compiling contracts...");
    await hre.run("compile");

    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    console.log("Deploying SupplyChain...");
    const supplyChain = await SupplyChain.deploy({ gasLimit: 8000000 });
    
    await supplyChain.waitForDeployment();
    const address = await supplyChain.getAddress();

    console.log("CONTRACT_ADDRESS: " + address);
    
    // We get the first signer to log the private key if needed, Hardhat account #0
    const signers = await hre.ethers.getSigners();
    console.log("Deployed by (Signer 0):", signers[0].address);
    // Hardhat default private key for Account #0:
    console.log("PRIVATE_KEY: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
