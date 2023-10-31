import {
    AztecAddress,
    Fr,
    NotePreimage,
    PXE,
    Wallet,
    computeMessageSecretHash,
    createDebugLogger,
    createPXEClient,
    //createAztecNodeRpcClient,
    getSandboxAccountsWallets,
    computeAuthWitMessageHash,
    waitForSandbox
} from '@aztec/aztec.js';

import { format } from 'util';
import { SubscriptionContract } from './contracts/subscription/types/Subscription.js';
import { TokenContract } from './contracts/token/types/Token.js';

const { PXE_URL = 'http://localhost:8080' } = process.env;
//const { AZTEC_NODE_URL } = 'https://localhost:8079';

const logger = createDebugLogger('subscription:');

const deployTokenContract = async (wallet: Wallet, initialAdminBalance: bigint, admin: AztecAddress, secret: Fr) => {
    logger(`Deploying Token contract...`);
    const contract = await TokenContract.deploy(wallet, admin).send().deployed();

    if (initialAdminBalance > 0n) {
        await mintTokensAndRedeem(contract, admin, initialAdminBalance, secret, wallet);
    }

    logger('Token deployed at ' + contract.address.toString());

    return contract;
};

const mintTokens = async (contract: TokenContract, recipient: AztecAddress, balance: bigint, secret: Fr, pxe: PXE) => {
    //const secret = Fr.random();
    const secretHash = await computeMessageSecretHash(secret);

    const receipt = await contract.methods.mint_private(balance, secretHash).send().wait();

    const storageSlot = new Fr(5);
    const preimage = new NotePreimage([new Fr(balance), secretHash]);
    await pxe.addNote(recipient, contract.address, storageSlot, preimage, receipt.txHash);
};

const mintTokensAndRedeem = async (contract: TokenContract, recipient: AztecAddress, balance: bigint, secret: Fr, pxe: PXE) => {
    //const secret = Fr.random();
    const secretHash = await computeMessageSecretHash(secret);

    const receipt = await contract.methods.mint_private(balance, secretHash).send().wait();

    const storageSlot = new Fr(5);
    const preimage = new NotePreimage([new Fr(balance), secretHash]);
    await pxe.addNote(recipient, contract.address, storageSlot, preimage, receipt.txHash);

    logger('Redeeming tokens for Alice..');
    await contract.methods.redeem_shield(recipient, balance, secret).send().wait();
    let recipientBalance = await contract.methods.balance_of_private(recipient).view();
    logger(`Alice's private balance: ${recipientBalance}`);
};

async function main() {
    ////////////// CREATE THE CLIENT INTERFACE AND CONTACT THE SANDBOX //////////////
    // We create PXE client connected to the sandbox URL
    const pxe = createPXEClient(PXE_URL);

    logger(`Waiting for PXE to be ready on ${PXE_URL}...`)
    await waitForSandbox(pxe);

    const nodeInfo = await pxe.getNodeInfo();

    logger(format('Aztec Sandbox Info ', nodeInfo));


    ////////////// LOAD SOME ACCOUNTS FROM THE SANDBOX //////////////
    // The sandbox comes with a set of created accounts. Load them
    const accounts = await getSandboxAccountsWallets(pxe);
    const aliceWallet = accounts[0];
    const bobWallet = accounts[1];
    const alice = aliceWallet.getAddress();
    const bob = bobWallet.getAddress();
    logger(`Loaded alice's account at ${alice.toString()}`);
    logger(`Loaded bob's account at ${bob.toString()}`);


    ////////////// DEPLOY OUR TOKEN CONTRACT //////////////
    const secret = new Fr(55);
    const token = await deployTokenContract(aliceWallet, 1000000n, alice, secret);

    ////////////// DEPLOY OUR SUBSCRIPTION CONTRACT //////////////

    logger(`Deploying subscription contract...`);

    // Deploy the contract and set Alice as the admin while doing so

    const contract = await SubscriptionContract.deploy(aliceWallet, token.address).send().deployed();
    logger(`Subscription contract successfully deployed at ${contract.address.toString()}`);

    // Create the contract abstraction and link it to Alice's wallet for future signing
    const subsContractAlice = await SubscriptionContract.at(contract.address, aliceWallet);

    // Create a secret and a corresponding hash that will be used to mint funds privately
    const aliceSecret = Fr.random();
    const aliceSecretHash = await computeMessageSecretHash(aliceSecret);
    const alice_tokens = 10000n;

    

    const proj = 1;
    const exp = 20;
    const cd = 123;
    const beneficiary = bob;
    const amount = 500;

    logger(`Subscribing to a project for Alice...`);
    const nonce = 100;
    let action = token.withWallet(accounts[0]).methods.transfer(alice, beneficiary, amount, nonce);
    const messageHash = await computeAuthWitMessageHash(contract.address, action.request());
    const witness = await accounts[0].createAuthWitness(messageHash);
    await accounts[0].addAuthWitness(witness);

    const receipt = await subsContractAlice.methods.subscribe_and_mint(proj, exp, cd, token.address, beneficiary, amount, nonce).send().wait();

    logger(`Private Subscription NFT successfully minted and redeemed by Alice`);

    const valid_note = await subsContractAlice.methods.fetch_first_valid_note(proj, 1, 2, alice.toField()).view();
    //logger('First note guaranteeing access to Alice for this project is...');
    //logger(valid_note.toString());
    
    const block_receipt = receipt.blockNumber;
    logger('Block for tx receipt...'+block_receipt);
    
    //const aztec_node = createAztecNodeRpcClient(AZTEC_NODE_URL);

    //logger(`Waiting for AZTEC Node to be ready on ${AZTEC_NODE_URL}...`)
    
    
}

main();
