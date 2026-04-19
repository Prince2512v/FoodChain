const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

async function main() {
    const contractPath = path.resolve(__dirname, '../contracts', 'SupplyChain.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'SupplyChain.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    console.log('Compiling...');
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
        output.errors.forEach(err => {
            if (err.severity === 'error') {
                console.error(err.formattedMessage);
                process.exit(1);
            }
            console.warn(err.formattedMessage);
        });
    }

    const contract = output.contracts['SupplyChain.sol']['SupplyChain'];
    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;

    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    const signer = provider.getSigner(0); // Use first account from Ganache

    console.log('Deploying...');
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const instance = await factory.deploy();
    await instance.deployed();

    console.log('CONTRACT_ADDRESS:' + instance.address);
    console.log('PRIVATE_KEY: 0x3116c127bc686af07e734b00529871f65bc64c70a0813b907b0606cd330cf8f2'); 
}

main().catch(console.error);
