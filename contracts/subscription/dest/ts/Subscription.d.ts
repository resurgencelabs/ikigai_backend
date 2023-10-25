import { AztecAddress, AztecAddressLike, ContractArtifact, ContractBase, ContractFunctionInteraction, ContractMethod, DeployMethod, FieldLike, PublicKey, Wallet } from '@aztec/aztec.js';
export declare const SubscriptionContractArtifact: ContractArtifact;
/**
 * Type-safe interface for contract Subscription;
 */
export declare class SubscriptionContract extends ContractBase {
    private constructor();
    /**
     * Creates a contract instance.
     * @param address - The deployed contract's address.
     * @param wallet - The wallet to use when interacting with the contract.
     * @returns A promise that resolves to a new Contract instance.
     */
    static at(address: AztecAddress, wallet: Wallet): Promise<SubscriptionContract>;
    /**
     * Creates a tx to deploy a new instance of this contract.
     */
    static deploy(wallet: Wallet): DeployMethod<SubscriptionContract>;
    /**
     * Creates a tx to deploy a new instance of this contract using the specified public key to derive the address.
     */
    static deployWithPublicKey(publicKey: PublicKey, wallet: Wallet): DeployMethod<SubscriptionContract>;
    /**
     * Returns this contract's artifact.
     */
    static get artifact(): ContractArtifact;
    /** Type-safe wrappers for the public methods exposed by the contract. */
    methods: {
        /** assert_note(n: field) */
        assert_note: ((n: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;
        /** compute_note_hash_and_nullifier(contract_address: field, nonce: field, storage_slot: field, preimage: array) */
        compute_note_hash_and_nullifier: ((contract_address: FieldLike, nonce: FieldLike, storage_slot: FieldLike, preimage: FieldLike[]) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;
        /** is_subscriber(proj: field, tier: field, now: field) */
        is_subscriber: ((proj: FieldLike, tier: FieldLike, now: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;
        /** subscribe_and_mint(proj: field, exp: field, cd: field, token_contract: struct, beneficiary: field, amount: field) */
        subscribe_and_mint: ((proj: FieldLike, exp: FieldLike, cd: FieldLike, token_contract: AztecAddressLike, beneficiary: FieldLike, amount: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;
    };
}
//# sourceMappingURL=Subscription.d.ts.map