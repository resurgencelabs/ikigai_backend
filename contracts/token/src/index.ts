import {
  Fr,
  NotePreimage,
  PXE,
  computeMessageSecretHash,
  createDebugLogger,
  createPXEClient,
  getSandboxAccountsWallets,
  getSchnorrAccount,
  waitForSandbox,
} from '@aztec/aztec.js';
import { GrumpkinScalar } from '@aztec/circuits.js';
import { TokenContract } from '@aztec/noir-contracts/types';

import { format } from 'util';

const { PXE_URL = 'http://localhost:8080' } = process.env;

async function main() {
////////////// CREATE THE CLIENT INTERFACE AND CONTACT THE SANDBOX //////////////
    const logger = createDebugLogger('token');

    // We create PXE client connected to the sandbox URL
    const pxe = createPXEClient(PXE_URL);
    // Wait for sandbox to be ready
    await waitForSandbox(pxe);

    const nodeInfo = await pxe.getNodeInfo();

    logger(format('Aztec Sandbox Info ', nodeInfo));


    ////////////// LOAD SOME ACCOUNTS FROM THE SANDBOX //////////////
    // The sandbox comes with a set of created accounts. Load them
    const accounts = await getSandboxAccountsWallets(pxe);
    const alice = accounts[0].getAddress();
    const bob = accounts[1].getAddress();
    logger(`Loaded alice's account at ${alice.toString()}`);
    logger(`Loaded bob's account at ${bob.toString()}`);


    ////////////// DEPLOY OUR TOKEN CONTRACT //////////////

    const initialSupply = 1_000_001n;
    logger(`Deploying token contract...`);

    // Deploy the contract and set Alice as the admin while doing so
    const contract = await TokenContract.deploy(accounts[0], alice).send().deployed();
    logger(`Contract successfully deployed at address ${contract.address.toString()}`);
    
    // Create the contract abstraction and link it to Alice's wallet for future signing
    const tokenContractAlice = await TokenContract.at(contract.address, accounts[0]);

    // Create a secret and a corresponding hash that will be used to mint funds privately
    const aliceSecret = Fr.random();
    const aliceSecretHash = await computeMessageSecretHash(aliceSecret);

    logger(`Minting tokens to Alice...`);
    // Mint the initial supply privately "to secret hash"
    const receipt = await tokenContractAlice.methods.mint_private(initialSupply, aliceSecretHash).send().wait();

    // Add the newly created "pending shield" note to PXE
    const pendingShieldsStorageSlot = new Fr(5); // The storage slot of `pending_shields` is 5.
    const preimage = new NotePreimage([new Fr(initialSupply), aliceSecretHash]);
    await pxe.addNote(alice, contract.address, pendingShieldsStorageSlot, preimage, receipt.txHash);

    // Make the tokens spendable by redeeming them using the secret (converts the "pending shield note" created above
    // to a "token note")
    await tokenContractAlice.methods.redeem_shield(alice, initialSupply, aliceSecret).send().wait();
    logger(`${initialSupply} tokens were successfully minted and redeemed by Alice`);
    
}

main();
