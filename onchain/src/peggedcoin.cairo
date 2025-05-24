#[starknet::contract]
mod PeggedCoin {
    use afk_ignite::interfaces::peggedcoin::{
        ADMIN_ROLE, AdminVaultEvent, IAdminVault, IERC20Basic, IPeggedCoin, MINTER_ROLE,
        MintDepositEvent, OPERATOR_ROLE, WithdrawnEvent,
        TokenCollateral,
    };
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc20::interface::{
        IERC20Dispatcher, IERC20DispatcherTrait, IERC20Metadata, IERC20MetadataDispatcher,
    };
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use crate::errors;
    // use super::{
    //     ADMIN_ROLE, AdminVaultEvent, IAdminVault, IERC20Basic, IStablecoin, MINTER_ROLE,
    //     MintDepositEvent, OPERATOR_ROLE, WithdrawnEvent,
    // };
    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // ERC20 Mixin
    // #[abi(embed_v0)]
    // impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;

    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC20CamelOnlyImpl = ERC20Component::ERC20CamelOnlyImpl<ContractState>;
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

    const BPS: u256 = 10_000; // 100% = 10_000 bps

    

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
        total_minted_amount: u256,
        mint_per_user: Map<ContractAddress, u256>,
        mint_per_token: Map<ContractAddress, u256>,
        deposit_token_per_user: Map<ContractAddress, Map<ContractAddress, u256>>,
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
        MintDepositEvent: MintDepositEvent,
        WithdrawnEvent: WithdrawnEvent,
        AdminVaultEvent: AdminVaultEvent,
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
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        recipient: ContractAddress,
        decimals: u8,
        token_address: ContractAddress,
    ) {
        let caller = get_caller_address();

        // Call the internal function that writes decimals to storage
        self._set_decimals(decimals);

        self.erc20.initializer(name, symbol);

        // AccessControl-related initialization
        self.ownable.initializer(caller);

        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(MINTER_ROLE, caller);
        self.accesscontrol._grant_role(ADMIN_ROLE, caller);
        self.accesscontrol._grant_role(OPERATOR_ROLE, caller);

        self
            .token_collateral
            .entry(token_address)
            .write(
                TokenCollateral {
                    token_address: token_address,
                    is_accepted: true,
                    is_fees_deposit: true,
                    is_fees_withdraw: true,
                    fee_deposit_percentage: 0,
                    fee_withdraw_percentage: 0,
                },
            );
    }


    #[abi(embed_v0)]
    impl ERC20MetadataImpl of IERC20Metadata<ContractState> {
        fn decimals(self: @ContractState) -> u8 {
            // Change the `decimals storage` below to the desired number of decimals
            self.decimals.read()
        }

        fn name(self: @ContractState) -> ByteArray {
            self.erc20.ERC20_name.read()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.erc20.ERC20_symbol.read()
        }
    }
 
    #[abi(embed_v0)]
    impl IPeggedCoinImpl of IPeggedCoin<ContractState> {
        fn deposit(
            ref self: ContractState,
            recipient: ContractAddress,
            amount: u256,
            token_address: ContractAddress,
        ) -> bool {
            self._deposit(recipient, amount, token_address);
            true
        }

        fn withdraw(
            ref self: ContractState,
            recipient: ContractAddress,
            amount: u256,
            token_address: ContractAddress,
        ) -> bool {
            self._withdrawn(recipient, amount, token_address);
            true
        }
    }

    #[abi(embed_v0)]
    impl IAdminVaultImpl of IAdminVault<ContractState> {
        fn set_token_collateral(
            ref self: ContractState,
            token_address: ContractAddress,
            is_accepted: bool,
            is_fees_deposit: bool,
            is_fees_withdraw: bool,
            fee_deposit_percentage: u256,
            fee_withdraw_percentage: u256,
        ) -> bool {
            self
                .token_collateral
                .entry(token_address)
                .write(
                    TokenCollateral {
                        token_address: token_address,
                        is_accepted: is_accepted,
                        is_fees_deposit: is_fees_deposit,
                        is_fees_withdraw: is_fees_withdraw,
                        fee_deposit_percentage: fee_deposit_percentage,
                        fee_withdraw_percentage: fee_withdraw_percentage,
                    },
                );
            true
        }

        fn set_token_accepted(
            ref self: ContractState, token_address: ContractAddress, is_accepted: bool,
        ) -> bool {
            self.token_accepted.entry(token_address).write(is_accepted);
            true
        }

        fn set_fees(
            ref self: ContractState,
            is_fees_deposit: bool,
            fee_deposit_percentage: u256,
            is_fees_withdraw: bool,
            fee_withdraw_percentage: u256,
        ) -> bool {
            self.is_fees_deposit.write(is_fees_deposit);
            self.fee_deposit_percentage.write(fee_deposit_percentage);
            self.is_fees_withdraw.write(is_fees_withdraw);
            self.fee_withdraw_percentage.write(fee_withdraw_percentage);
            self
                .emit(
                    AdminVaultEvent {
                        is_fees_deposit: is_fees_deposit,
                        fee_deposit_percentage: fee_deposit_percentage,
                        is_fees_withdraw: is_fees_withdraw,
                        fee_withdraw_percentage: fee_withdraw_percentage,
                    },
                );
            true
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

        fn _deposit(
            ref self: ContractState,
            recipient: ContractAddress,
            amount: u256,
            token_address: ContractAddress,
        ) {
            let caller = get_caller_address();
            let token_collateral = self.token_collateral.entry(token_address).read();
            assert(token_collateral.is_accepted, errors::TOKEN_NOT_ACCEPTED);

            let amount_deposited_per_user = self.mint_per_user.entry(caller).read();
            let amount_deposited_per_token = self.mint_per_token.entry(token_address).read();
            let amount_deposited_per_user_token = self
                .deposit_token_per_user
                .entry(caller)
                .entry(token_address)
                .read();
            let new_amount_deposited_per_user = amount_deposited_per_user + amount;
            let new_amount_deposited_per_token = amount_deposited_per_token + amount;
            self.mint_per_user.entry(caller).write(new_amount_deposited_per_user);
            self.mint_per_token.entry(token_address).write(new_amount_deposited_per_token);
            self
                .deposit_token_per_user
                .entry(caller)
                .entry(token_address)
                .write(amount_deposited_per_user_token + amount);


            let deposit_amount_per_user_token = self.deposit_token_per_user.entry(caller).entry(token_address).read();
            // println!("deposit_amount_per_user_token: {}", deposit_amount_per_user_token);
            self.total_minted_amount.write(self.total_minted_amount.read() + deposit_amount_per_user_token);

            let erc20_quote = IERC20Dispatcher { contract_address: token_address };
            erc20_quote.transfer_from(caller, get_contract_address(), amount);

            // deducted fees if 1=1
            // TODO fees per token
   
            let mut fee_amount = 0;
            let fee_deposit_percentage = self.fee_deposit_percentage.read();
            if self.is_fees_deposit.read() {
                fee_amount = amount * fee_deposit_percentage / 10_000;
                erc20_quote.transfer_from(caller, get_contract_address(), fee_amount);
            }

            // let token_collateral = self.token_collateral.entry(token_address).read();
            // let is_fees_deposit_token = token_collateral.is_fees_deposit;
            // let fee_deposit_percentage_token = token_collateral.fee_deposit_percentage;
            // if is_fees_deposit_token {
            //     fee_amount = amount * fee_deposit_percentage / 10_000;
            //     erc20_quote.transfer_from(caller, get_contract_address(), fee_amount);
            // }

            let amount_to_mint = amount - fee_amount;
            self.erc20.mint(recipient, amount_to_mint);

            self
                .emit(
                    MintDepositEvent {
                        is_fees_deposit: self.is_fees_deposit.read(),
                        fee_deposit_percentage: fee_deposit_percentage,
                        amount_send: amount,
                        amount_received: amount,
                        token_address: token_address,
                        recipient: recipient,
                        caller: caller,
                    },
                );
        }

        fn _withdrawn(
            ref self: ContractState,
            recipient: ContractAddress,
            amount: u256,
            token_address: ContractAddress,
        ) {
            // Set permissions with Ownable
            let caller = get_caller_address();

            let token_collateral = self.token_collateral.entry(token_address).read();
            assert(token_collateral.is_accepted, errors::TOKEN_NOT_ACCEPTED);

            let amount_to_withdraw = self.mint_per_user.entry(caller).read();
            let amount_token_deposit = self.mint_per_token.entry(token_address).read();
            let amount_deposited_per_user_token = self
                .deposit_token_per_user
                .entry(caller)
                .entry(token_address)
                .read();

            // println!("amount_deposited_per_user_token: {}", amount_deposited_per_user_token);
            // println!("amount_token_deposit: {}", amount_token_deposit);
            // println!("amount_to_withdraw: {}", amount_to_withdraw);
            // println!("amount: {}", amount);
            assert(amount_deposited_per_user_token >= amount, errors::INSUFFICIENT_BALANCE);
            let new_amount_to_withdraw = amount_to_withdraw - amount;
            let new_amount_token_deposit = amount_token_deposit - amount;

            // assert(new_amount_to_withdraw >= 0, errors::INSUFFICIENT_BALANCE);
            // assert(new_amount_token_deposit >= 0, errors::INSUFFICIENT_BALANCE);

            self.mint_per_user.entry(caller).write(new_amount_to_withdraw);
            self.mint_per_token.entry(token_address).write(new_amount_token_deposit);
            self.total_minted_amount.write(self.total_minted_amount.read() - amount);
            self
                .deposit_token_per_user
                .entry(caller)
                .entry(token_address)
                .write(amount_deposited_per_user_token - amount);

            let fee_deposit_percentage = self.fee_deposit_percentage.read();
            let fee_withdraw_percentage = self.fee_withdraw_percentage.read();

            let erc20_quote = IERC20Dispatcher { contract_address: token_address };
            let mut fee_amount = 0;
            if self.is_fees_withdraw.read() {
                fee_amount = amount * fee_withdraw_percentage / 10_000;
                erc20_quote.transfer(recipient, fee_amount);
            }

            erc20_quote.transfer(recipient, amount - fee_amount);

            self.erc20.burn(caller, amount);

            self
                .emit(
                    WithdrawnEvent {
                        is_fees_deposit: self.is_fees_deposit.read(),
                        fee_deposit_percentage: fee_deposit_percentage,
                        amount_send: amount,
                        amount_received: amount,
                        token_address: token_address,
                        recipient: recipient,
                        caller: caller,
                    },
                );
        }
    }
}
