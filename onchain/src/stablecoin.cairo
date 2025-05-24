use starknet::ContractAddress;

pub const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");
pub const ADMIN_ROLE: felt252 = selector!("ADMIN_ROLE");
pub const OPERATOR_ROLE: felt252 = selector!("OPERATOR_ROLE");

#[starknet::interface]
trait IERC20Basic<TContractState> {
    fn name(self: @TContractState) -> ByteArray;
    fn symbol(self: @TContractState) -> ByteArray;
    fn decimals(self: @TContractState) -> u8;
}


#[starknet::interface]
trait IStablecoin<TContractState> {
    // fn name(self: @TContractState) -> ByteArray;
    // fn symbol(self: @TContractState) -> ByteArray;
    // fn decimals(self: @TContractState) -> u8;
    // fn totalSupply(self: @TContractState) -> u256;
    // fn balanceOf(self: @TContractState, address: ContractAddress) -> u256;
    // fn transfer(self: @TContractState, to: ContractAddress, value: u256) -> bool;

    fn burn(self: @TContractState, amount: u256) -> bool;
    fn store_name(self: @TContractState, name: felt252);
}

#[derive(Drop, starknet::Event, Serde, Copy)]
pub struct MintDepositEvent {
    pub is_fees_deposit: bool,
    pub fee_deposit_percentage: u256,
    pub amount_send:u256,
    pub amount_received: u256,
    pub token_address: ContractAddress,
    pub recipient: ContractAddress,
    pub caller: ContractAddress,
}

#[starknet::contract]
mod Stablecoin {
    use ekubo::interfaces::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use super::{ADMIN_ROLE, IERC20Basic, IStablecoin, MINTER_ROLE, OPERATOR_ROLE, MintDepositEvent};
    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    // ERC20 Mixin
    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    // Ownable Mixin
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // Upgradeable
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    // AccessControl
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    // SRC5
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;


    #[derive(Drop, starknet::Store, Serde, Copy)]
    pub struct TokenCollateral {
        pub token_address: ContractAddress,
        pub is_accepted: bool,
        pub is_fees_deposit: bool,
        pub is_fees_withdraw: bool,
        pub fee_deposit_percentage: u256,
        pub fee_withdraw_percentage: u256,
    }

    #[storage]
    struct Storage {
        decimals: u8,
        token_address: ContractAddress,
        token_accepted: Map<ContractAddress, bool>,
        token_collateral: Map<ContractAddress, TokenCollateral>,
        is_fees_deposit: bool,
        is_fees_withdraw: bool,
        fee_deposit_percentage: u256,
        fee_withdraw_percentage: u256,
        names: Map<ContractAddress, felt252>,
        total_names: u128,
        total_minted_amount: u256,
        mint_per_user: Map<ContractAddress, u256>,
        mint_per_token: Map<ContractAddress, u256>,
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        MintDepositEvent: MintDepositEvent,
        #[flat]
        ERC20Event: ERC20Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState, initial_supply: u256, recipient: ContractAddress, decimals: u8,
    ) {
        let name = "MyToken";
        let symbol = "MTK";

        let caller = get_caller_address();
        self.ownable.initializer(caller);

        // AccessControl-related initialization
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(MINTER_ROLE, caller);
        self.accesscontrol._grant_role(ADMIN_ROLE, caller);
        self.accesscontrol._grant_role(OPERATOR_ROLE, caller);

        // Call the internal function that writes decimals to storage
        self._set_decimals(decimals);

        self.erc20.initializer(name, symbol);
        self.erc20.mint(recipient, initial_supply);
    }

    // #[abi(embed_v0)]
    // impl ERC20MetadataImpl of interface::IERC20Metadata<ContractState> {
    //     fn name(self: @ContractState) -> ByteArray {
    //         self.erc20.name()
    //     }

    //     fn symbol(self: @ContractState) -> ByteArray {
    //         self.erc20.symbol()
    //     }

    //     fn decimals(self: @ContractState) -> u8 {
    //         self.decimals.read()
    //     }
    // }

    #[external(v0)]
    fn deposit(
        ref self: ContractState,
        recipient: ContractAddress,
        amount: u256,
        token_address: ContractAddress,
    ) {
        // Set permissions with Ownable
        self.ownable.assert_only_owner();
        let caller = get_caller_address();

        let token_collateral = self.token_collateral.entry(token_address).read();

        if token_collateral.is_accepted {
            // Mint tokens if called by the contract owner
            self.erc20.mint(recipient, amount);

            self._mint(self.owner(), amount);
        }

        self.mint_per_user.entry(caller).write(amount);
        self.mint_per_token.entry(token_address).write(amount);
        self.total_minted_amount.write(self.total_minted_amount.read() + amount);

        let erc20_quote = IERC20Dispatcher { contract_address: token_address };
        erc20_quote.transferFrom(caller, get_contract_address(), amount);

        // deducted fees if 1=1
        let fee_deposit_percentage = self.fee_deposit_percentage.read();
        if self.is_fees_deposit.read() {
            let fee_amount = amount * fee_deposit_percentage / 100;
            erc20_quote.transferFrom(caller, get_contract_address(), fee_amount);
        }

        self.erc20.mint(recipient, amount);

        self.emit( MintDepositEvent {
            is_fees_deposit: self.is_fees_deposit.read(),
            fee_deposit_percentage: fee_deposit_percentage,
            amount_send: amount,
            amount_received: amount,
            token_address: token_address,
            recipient: recipient,
            caller: caller,
        });
    }


    #[abi(embed_v0)]
    impl IERC20BasicImpl of IERC20Basic<ContractState> {
        fn name(self: @ContractState) -> ByteArray {
            self.erc20.name()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.erc20.symbol()
        }

        fn decimals(self: @ContractState) -> u8 {
            self.decimals.read()
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _set_decimals(ref self: ContractState, decimals: u8) {
            self.decimals.write(decimals);
        }

        fn _mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            self.erc20.mint(to, amount);
        }
    }

}
