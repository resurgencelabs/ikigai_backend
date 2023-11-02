import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import subscription_external from './target/subscription_external.json' assert { type: "json" };;



export async function noir_proof(input){
    console.log(input);
    const backend = new BarretenbergBackend(subscription_external);
    const noir = new Noir(subscription_external, backend);
    const proof = await noir.generateFinalProof(input);
    const verification = await noir.verifyFinalProof(proof);
    return verification;
}