import {
    Fr,
    PXE,
    Contract,
    computeMessageSecretHash,
    createDebugLogger,
    createPXEClient,
    getSandboxAccountsWallets,
    getSchnorrAccount,
    waitForSandbox,
    AztecAddress,
  } from '@aztec/aztec.js';
  
  import { SubscriptionContract } from "../../contracts/subscription/core/ts/Subscription.js";
  
  import { format } from 'util';
  
  const { PXE_URL = 'http://localhost:8080' } = process.env;
  
  async function main() {
  ////////////// CREATE THE CLIENT INTERFACE AND CONTACT THE SANDBOX //////////////
      const logger = createDebugLogger('subscription');
  
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
  
  
      ////////////// DEPLOY OUR SUBSCRIPTION CONTRACT //////////////
  
      
      logger(`Deploying subscription contract...`);
      
      // Deploy the contract and set Alice as the admin while doing so
    
      const contract = await SubscriptionContract.deploy(pxe).send().deployed();
      logger(`Contract successfully deployed at address ${contract.address.toString()}`);
  
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
  
      logger(`Subscribing to a project for Alice...`);
      // Mint the initial supply privately "to secret hash"
      const receipt = await subsContractAlice.methods.subscribe_and_mint(proj, exp, cd, token_contract, beneficiary, amount).send().wait();
  
      
      logger(`Private Subscription NFT successfully minted and redeemed by Alice`);
  }
  
  main();
  