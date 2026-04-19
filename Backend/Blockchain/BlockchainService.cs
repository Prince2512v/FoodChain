using Nethereum.Web3;
using Nethereum.Contracts;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace FoodSupplyChainAPI.Blockchain
{
    public class BlockchainService
    {
        private readonly string _rpcUrl;
        private readonly string _contractAddress;
        private readonly string _privateKey;
        private readonly Web3 _web3;

        public BlockchainService(IConfiguration configuration)
        {
            _rpcUrl = configuration["Blockchain:RpcUrl"] ?? "http://127.0.0.1:8545";
            _contractAddress = configuration["Blockchain:ContractAddress"] ?? "0x5FbDB2315678afecb367f032d93F642f64180aa3";
            _privateKey = configuration["Blockchain:PrivateKey"] ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
            
            var account = new Nethereum.Web3.Accounts.Account(_privateKey);
            _web3 = new Web3(account, _rpcUrl);
        }

        public async Task<string> AddProductAsync(string batchId, string dataHash)
        {
            var contract = _web3.Eth.GetContract(GetAbi(), _contractAddress);
            var function = contract.GetFunction("addProduct");
            return await function.SendTransactionAsync(_web3.TransactionManager.Account.Address, null, null, batchId, dataHash);
        }

        public async Task<string> ProcessProductAsync(string batchId, string status, string dataHash)
        {
            var contract = _web3.Eth.GetContract(GetAbi(), _contractAddress);
            var function = contract.GetFunction("processProduct");
            return await function.SendTransactionAsync(_web3.TransactionManager.Account.Address, null, null, batchId, status, dataHash);
        }

        public async Task<string> UpdateShipmentAsync(string batchId, string status, string dataHash)
        {
            var contract = _web3.Eth.GetContract(GetAbi(), _contractAddress);
            var function = contract.GetFunction("updateShipment");
            return await function.SendTransactionAsync(_web3.TransactionManager.Account.Address, null, null, batchId, status, dataHash);
        }

        public async Task<string> ReceiveProductAsync(string batchId, string status, string dataHash)
        {
            var contract = _web3.Eth.GetContract(GetAbi(), _contractAddress);
            var function = contract.GetFunction("receiveProduct");
            return await function.SendTransactionAsync(_web3.TransactionManager.Account.Address, null, null, batchId, status, dataHash);
        }

        public async Task<dynamic> GetProductHistoryAsync(string batchId)
        {
            var contract = _web3.Eth.GetContract(GetAbi(), _contractAddress);
            var function = contract.GetFunction("getProduct");
            return await function.CallDeserializingToObjectAsync<ProductDTO>(batchId);
        }

        // Integrity Verification Helper
        public string CalculateHash(string input)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(input));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }

        private string GetAbi()
        {
            return @"[
                { 'inputs': [ { 'internalType': 'string', 'name': '_batchId', 'type': 'string' }, { 'internalType': 'string', 'name': '_dataHash', 'type': 'string' } ], 'name': 'addProduct', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function' },
                { 'inputs': [ { 'internalType': 'string', 'name': '_batchId', 'type': 'string' }, { 'internalType': 'string', 'name': '_status', 'type': 'string' }, { 'internalType': 'string', 'name': '_dataHash', 'type': 'string' } ], 'name': 'processProduct', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function' },
                { 'inputs': [ { 'internalType': 'string', 'name': '_batchId', 'type': 'string' }, { 'internalType': 'string', 'name': '_status', 'type': 'string' }, { 'internalType': 'string', 'name': '_dataHash', 'type': 'string' } ], 'name': 'updateShipment', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function' },
                { 'inputs': [ { 'internalType': 'string', 'name': '_batchId', 'type': 'string' }, { 'internalType': 'string', 'name': '_status', 'type': 'string' }, { 'internalType': 'string', 'name': '_dataHash', 'type': 'string' } ], 'name': 'receiveProduct', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function' },
                { 'inputs': [ { 'internalType': 'string', 'name': '_batchId', 'type': 'string' } ], 'name': 'getProduct', 'outputs': [ { 'internalType': 'string', 'name': 'batchId', 'type': 'string' }, { 'internalType': 'address', 'name': 'currentOwner', 'type': 'address' }, { 'internalType': 'string', 'name': 'status', 'type': 'string' }, { 'internalType': 'uint256[]', 'name': 'timestamps', 'type': 'uint256[]' }, { 'internalType': 'string[]', 'name': 'transactionHashes', 'type': 'string[]' } ], 'stateMutability': 'view', 'type': 'function' }
            ]";
        }

        [Nethereum.ABI.FunctionEncoding.Attributes.FunctionOutput]
        public class ProductDTO
        {
            [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "batchId", 1)]
            public string BatchId { get; set; }
            [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "currentOwner", 2)]
            public string CurrentOwner { get; set; }
            [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "status", 3)]
            public string Status { get; set; }
            [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256[]", "timestamps", 4)]
            public List<System.Numerics.BigInteger> Timestamps { get; set; }
            [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string[]", "transactionHashes", 5)]
            public List<string> TransactionHashes { get; set; }
        }
    }
}
