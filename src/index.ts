import {
    AztecAddress,
    Fr,
    NotePreimage,
    PXE,
    Wallet,
    computeMessageSecretHash,
    createPXEClient,
    getSandboxAccountsWallets,
    waitForSandbox
} from '@aztec/aztec.js';

import { TokenContract } from '@aztec/noir-contracts/types';
import { format } from 'util';
import { SubscriptionContract } from './contracts/subscription/types/Subscription.js';

const { PXE_URL = 'http://localhost:8080' } = process.env;

const deployTokenContract = async (wallet: Wallet, initialAdminBalance: bigint, admin: AztecAddress) => {
    console.log(`Deploying Token contract...`);
    const contract = await TokenContract.deploy(wallet, admin).send().deployed();

    if (initialAdminBalance > 0n) {
        await mintTokens(contract, admin, initialAdminBalance, wallet);
    }

    console.log('L2 contract deployed');

    return contract.completeAddress;
};

const mintTokens = async (contract: TokenContract, recipient: AztecAddress, balance: bigint, pxe: PXE) => {
    const secret = Fr.random();
    const secretHash = await computeMessageSecretHash(secret);

    const receipt = await contract.methods.mint_private(balance, secretHash).send().wait();

    const storageSlot = new Fr(5);
    const preimage = new NotePreimage([new Fr(balance), secretHash]);
    await pxe.addNote(recipient, contract.address, storageSlot, preimage, receipt.txHash);
};

async function main() {
    ////////////// CREATE THE CLIENT INTERFACE AND CONTACT THE SANDBOX //////////////
    // We create PXE client connected to the sandbox URL
    const pxe = createPXEClient(PXE_URL);
    // Wait for sandbox to be ready
    await waitForSandbox(pxe);

    const nodeInfo = await pxe.getNodeInfo();

    console.log(format('Aztec Sandbox Info ', nodeInfo));


    ////////////// LOAD SOME ACCOUNTS FROM THE SANDBOX //////////////
    // The sandbox comes with a set of created accounts. Load them
    const accounts = await getSandboxAccountsWallets(pxe);
    const aliceWallet = accounts[0];
    const bobWallet = accounts[1];
    const alice = aliceWallet.getAddress();
    const bob = bobWallet.getAddress();
    console.log(`Loaded alice's account at ${alice.toString()}`);
    console.log(`Loaded bob's account at ${bob.toString()}`);


    ////////////// DEPLOY OUR TOKEN CONTRACT //////////////
    await deployTokenContract(aliceWallet, 1000000n, alice)


    ////////////// DEPLOY OUR SUBSCRIPTION CONTRACT //////////////


    console.log(`Deploying subscription contract...`);

    // Deploy the contract and set Alice as the admin while doing so

    const contract = await SubscriptionContract.deploy(pxe).send().deployed();
    console.log(`Contract successfully deployed at address ${contract.address.toString()}`);

    // Create the contract abstraction and link it to Alice's wallet for future signing
    const subsContractAlice = await SubscriptionContract.at(contract.address, accounts[0]);

    // Create a secret and a corresponding hash that will be used to mint funds privately
    const aliceSecret = Fr.random();
    const aliceSecretHash = await computeMessageSecretHash(aliceSecret);

    const proj = 1;
    const exp = 20;
    const cd = 123;
    const token_contract = AztecAddress.fromString('0x2d8bca44025c49286d9f977a05a57da76b21ef1519554a8421dd4e4ac13d9fca');
    const beneficiary = bob;
    const amount = 500;

    console.log(`Subscribing to a project for Alice...`);
    // Mint the initial supply privately "to secret hash"
    const receipt = await subsContractAlice.methods.subscribe_and_mint(proj, exp, cd, token_contract, beneficiary, amount).send().wait();


    console.log(`Private Subscription NFT successfully minted and redeemed by Alice`);
}

main();
