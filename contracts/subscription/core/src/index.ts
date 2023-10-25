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
    computeAuthWitMessageHash,
  } from '@aztec/aztec.js';
  
  import { SubscriptionContract } from "../ts/Subscription.js";
  import { TokenContract, TokenContractArtifact } from '@aztec/noir-contracts/types';
  
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
    
      const contract = await SubscriptionContract.deploy(accounts[0]).send().deployed();
      logger(`Contract successfully deployed at address ${contract.address.toString()}`);
  
      // Create the contract abstraction and link it to Alice's wallet for future signing
      const subsContractAlice = await SubscriptionContract.at(contract.address, accounts[0]);
  
      // Create a secret and a corresponding hash that will be used to mint funds privately
      const aliceSecret = Fr.random();
      const aliceSecretHash = await computeMessageSecretHash(aliceSecret);

      const proj = 1;
      const exp = 20;
      const cd = 123;
      const token_contract_add = AztecAddress.fromString('0x25501663ecc80072e20d0d6f291fea05e995c299a837f6e8f434177ebb2c36f6');
      const beneficiary = bob;
      const amount = 500;
      
      
      logger(`Subscribing Alice to a project...`);
      //const contract_token = await TokenContract.at(token_contract_add, accounts[0]);
      const contract_token = await Contract.at(token_contract_add, TokenContractArtifact, accounts[0]);
      let action = contract_token.withWallet(accounts[0]).methods.transfer(alice, beneficiary, amount, 0);
      const messageHash = await computeAuthWitMessageHash(contract_token.address, action.request());
      const witness = await accounts[1].createAuthWitness(messageHash);
      await accounts[0].addAuthWitness(witness);
      
      const receipt = await subsContractAlice.methods.subscribe_and_mint(proj, exp, cd, token_contract_add, beneficiary, amount).send().wait();
  
      
      logger(`Private Subscription NFT successfully minted and redeemed by Alice`);
  }
  
  main();
  