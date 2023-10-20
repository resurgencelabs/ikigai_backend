# IKIGAI Backend  
A brief demo of how the simplified Ikigai (web 3 Patreon) smart contract works.  
Owned by Resurgence Labs.


# Steps to run  
cd token  
yarn start  
// look for the following type of line in the log that results  
// token Loaded alice's account at 0x25048e8c1b7dea68053d597ac2d920637c99523651edfb123d0632da785970d0 +11s  
// token Contract successfully deployed at address 0x198164384da0bde14f8dc34a6399c450ffd8c8a63309dd7ed513d36bbfda9fcd +12s  
export ADDRESS= // the address output for Alice's account   
export CONTRACT= // the address output for the contract  
export PK= // the private key for Alice, usually 0x2153536ff6628eee01cf4024889ff977a18d9fa61d0e414422f7681cf085c281   
aztec-cli call balance_of_private --args $ADDRESS --contract-artifact TokenContractArtifact --contract-address $CONTRACT  
// should output 1000001  
cd ../subscription   
aztec-cli compile .  
aztec-cli deploy target/Subscription.json   
// look for the address where the resulting log says the contract is deployed   
export CONTRACT2= // the address in the previous step  
aztec-cli send subscribe_and_mint --args 0x01 0x30 0x155 $CONTRACT  0x115f123bbc6cc6af9890055821cfba23a7c4e8832377a32ccb719a1ba3a86483 0x400 --contract-artifact target/Subscription.json --contract-address $CONTRACT2 --private-key $PK




