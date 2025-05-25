use starknet::ContractAddress;


#[starknet::contract]
mod DepositVault {
    use afk_ignite::interfaces::deposit_vault::{
        ADMIN_ROLE, OPERATOR_ROLE, MINTER_ROLE, IDepositVault
    };
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc20::interface::{
        IERC20Dispatcher, IERC20DispatcherTrait, IERC20Metadata, IERC20MetadataDispatcher,
    };
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{get_caller_address, get_contract_address};
    use super::{ContractAddress};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);


    // AccessControl
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;


    // Ownable Mixin
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // SRC5
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    const BPS: u256 = 10_000; // 100% = 10_000 bps


    #[storage]
    struct Storage {
        owner: ContractAddress,
        pragma_contract: ContractAddress,
        summary_stats: ContractAddress,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }


    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState, owner: ContractAddress,
    ) {
        self.owner.write(owner);

        // AccessControl-related initialization
        self.ownable.initializer(owner);

        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(MINTER_ROLE, owner);
        self.accesscontrol._grant_role(ADMIN_ROLE, owner);
        self.accesscontrol._grant_role(OPERATOR_ROLE, owner);
    }
    #[external(v0)]
    impl IDepositVaultImpl of IDepositVault<ContractState> {
        fn set_operator(ref self: ContractState, operator: ContractAddress) {
            self.accesscontrol._grant_role(OPERATOR_ROLE, operator);
        }
        fn transfer_from_operator(ref self: ContractState, token_address: ContractAddress, amount: u256, recipient: ContractAddress) -> bool {
            let caller = get_caller_address();
            let operator = self.accesscontrol.has_role(OPERATOR_ROLE, caller);
            println!("operator: {:?}", operator);
            assert!(operator, "Caller is not an operator");
            if !operator {
                return false;
            }

            let erc20_dispatcher = IERC20Dispatcher {
                contract_address: token_address,
            };

            let balance_of_token = erc20_dispatcher.balance_of(get_contract_address());

            assert!(balance_of_token >= amount, "Insufficient balance");
            println!("balance_of_token: {}", balance_of_token);
            println!("amount: {}", amount);
            println!("recipient: {:?}", recipient);

            erc20_dispatcher.transfer(recipient, amount);
            // erc20_dispatcher.transfer_from(caller, recipient, amount);
            true
        }
    }
}
