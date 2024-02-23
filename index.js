// import ethers.js library
const ethers = require('ethers');

// input infura, alchemy endpoint or the rpc url for celo test network
const rpcUrl = 'https://alfajores-forno.celo-testnet.org';

// create a provider
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

// usdc contract toke address for celo
const usdcTokenAddress = '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B'

// invoke the ABI
const minTokenAbi = [{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}]

// Input the addresses and the private key; specify number of tokens to send
const fromAddress = '0x99680b10Ce654634f19c98D95aF2018D25DC81c5' // Input the origin wallet address
const toAddress = '0x63a471Bd2464d0dbb16ab5600a4002E0A159A1f2' // Input the destination wallet address
const privatekey = '589ac66c8cbeb4436ca412145d072dadfa94da5ca331a388773d57aec4fa43df' // Input the private key of the sender's wallet, required to sign the transaction

const amount = 1; // Specify the number of USDC tokens to send

async function main() {
    const wallet = new ethers.Wallet(privatekey, provider);
    const contract = new ethers.Contract(usdcTokenAddress, minTokenAbi, wallet);

    //  get usdc decimals from the ABI
    const decimals = await contract.decimals();
    
    // get wallet balanace
    const balance = await contract.balanceOf(fromAddress);
    console.log("Balance of Sender Before transfer: ", ethers.utils.formatUnits(balance.toString(), 6));
    if (balance.lt(ethers.utils.parseUnits(
        amount.toString(), 6))) {
            throw new Error('Insufficient balance');
        }

    // get balance of receiver before transfer
    const balanceBefore = await contract.balanceOf(toAddress);
    console.log("Balance of Receiver Before transfer: ", ethers.utils.formatUnits(balanceBefore.toString(), 6));
    
    // calaculate value in the smallest unit (10 USDC would be 10000000 in its smallest unit).
    const amountParsed = ethers.utils.parseUnits(amount.toString(), decimals); 
    
    // transfer the tokens
    let tx = await contract.transfer(toAddress, amountParsed);

    // wait for the transaction to be confirmed
    let receipt = await tx.wait();
    // console log tx hash with url like this https://alfajores.celoscan.io/tx/0xa8e2d78f0e0da19256c9f6dc7c6f4cba57a86ff9e3631df732839b2a20cb7fc4
    let url = `https://alfajores.celoscan.io/tx/${receipt.transactionHash}`;
    console.log(`Transaction ${receipt.transactionHash} confirmed, check it out at ${url}`);
    console.log("Transaction Hash: ", receipt.transactionHash);
    console.log("Gas used: ", receipt.gasUsed.toString());

    // get the balance of the sender after the transfer
    const balanceAfter = await contract.balanceOf(fromAddress);
    console.log("Balance of Sender After transfer: ", ethers.utils.formatUnits(balanceAfter.toString(), 6));

    // get the balance of the receiver after the transfer
    const balanceAfterReceiver = await contract.balanceOf(toAddress);
    console.log("Balance of Receiver After transfer: ", ethers.utils.formatUnits(balanceAfterReceiver.toString(), 6));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
