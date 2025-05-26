#[starknet::contract]
mod MintStablecoin {
    use afk_ignite::interfaces::deposit_vault::{
        IDepositVault, IDepositVaultDispatcher, IDepositVaultDispatcherTrait,
    };
    use afk_ignite::interfaces::mint_stablecoin::{
        ADMIN_ROLE, AdminVaultEvent, IAdminStablecoinVault, IAdminVault, IERC20Basic,
        IMintStablecoin, MINTER_ROLE, MintDepositEvent, OPERATOR_ROLE, TokenCollateral,
        WithdrawnEvent,
    };
    use afk_ignite::oracle_helpers::{
        compute_twap, compute_volatility, get_asset_conversion_rate, get_asset_price_average,
        get_asset_price_median,
    };
    use alexandria_math::fast_power::fast_power;
    use core::array::Array;
    use core::num::traits::Zero;
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc20::interface::{
        IERC20Dispatcher, IERC20DispatcherTrait, IERC20Metadata, IERC20MetadataDispatcher,
    };
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use pragma_lib::abi::{
        IPragmaABIDispatcher, IPragmaABIDispatcherTrait, IPragmaABISafeDispatcherTrait,
        PragmaPricesResponse,
    };
    use pragma_lib::types::DataType;
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use crate::errors;
    use crate::interfaces::mint_stablecoin::IViewMintStablecoin;
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
        pragma_contract: ContractAddress,
        summary_stats_address: ContractAddress,
        token_id: felt252,
        decimals: u8,
        token_address: ContractAddress,
        token_accepted: Map<ContractAddress, bool>,
        token_id_accepted: Map<felt252, bool>,
        token_id_address: Map<ContractAddress, felt252>,
        token_address_per_id: Map<felt252, ContractAddress>,
        token_collateral: Map<ContractAddress, TokenCollateral>,
        is_fees_deposit: bool,
        is_fees_withdraw: bool,
        fee_deposit_percentage: u256,
        fee_withdraw_percentage: u256,
        total_minted_amount: u256,
        total_deposited_amount: u256,
        mint_per_user: Map<ContractAddress, u256>,
        mint_per_token: Map<ContractAddress, u256>,
        total_mint_per_token: Map<ContractAddress, u256>,
        deposit_per_user: Map<ContractAddress, u256>,
        deposit_per_token: Map<ContractAddress, u256>,
        deposit_token_per_user: Map<ContractAddress, Map<ContractAddress, u256>>,
        debt_per_user: Map<ContractAddress, u256>,
        debt_quote_token_per_user: Map<ContractAddress, Map<ContractAddress, u256>>,
        // Params of vault
        deposit_vault: ContractAddress,
        is_deposit_vault_enabled: bool,
        is_collaterization_enabled: bool,
        collaterization_ratio: u256,
        collateral_debt_ratio: u256,
        is_under_collateral: bool,
        debt: u256,
        total_mint_cap: u256,
        is_withdraw_current_price: bool,
        is_option_mode: bool,
        is_immediate_withdraw: bool,
        option_expiry_epoch: u64,
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
        pragma_contract: ContractAddress,
        summary_stats_address: ContractAddress,
        recipient: ContractAddress,
        token_address: ContractAddress,
        decimals: u8,
        name: ByteArray,
        symbol: ByteArray,
        token_id: felt252,
    ) {
        let caller = get_caller_address();

        // Call the internal function that writes decimals to storage
        self._set_decimals(decimals);

        self.pragma_contract.write(pragma_contract);
        self.summary_stats_address.write(summary_stats_address);
        self.token_id.write(token_id);
        self.token_id_address.entry(token_address).write(token_id);
        self.token_address_per_id.entry(token_id).write(token_address);
        self.token_id_accepted.entry(token_id).write(true);
        // AccessControl-related initialization
        self.ownable.initializer(caller);

        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(MINTER_ROLE, caller);
        self.accesscontrol._grant_role(ADMIN_ROLE, caller);
        self.accesscontrol._grant_role(OPERATOR_ROLE, caller);

        self.accesscontrol._grant_role(MINTER_ROLE, recipient);
        self.accesscontrol._grant_role(ADMIN_ROLE, recipient);
        self.accesscontrol._grant_role(OPERATOR_ROLE, recipient);

        // params basic
        self.is_option_mode.write(true);
        self.is_immediate_withdraw.write(true);
        self.is_withdraw_current_price.write(true);

        self.total_mint_cap.write(100_000_u256);

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
                    token_id: token_id,
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
    impl IMintStablecoinImpl of IMintStablecoin<ContractState> {
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
            token_id: felt252,
        ) -> bool {
            let caller = get_contract_address();

            assert(self.accesscontrol.has_role(ADMIN_ROLE, caller), errors::NOT_AUTHORIZED);

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
                        token_id: token_id,
                    },
                );
            true
        }

        fn set_token_accepted(
            ref self: ContractState, token_address: ContractAddress, is_accepted: bool,
        ) -> bool {
            let caller = get_contract_address();

            assert(self.accesscontrol.has_role(ADMIN_ROLE, caller), errors::NOT_AUTHORIZED);

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
            let caller = get_contract_address();

            assert(self.accesscontrol.has_role(ADMIN_ROLE, caller), errors::NOT_AUTHORIZED);

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

        fn set_token_id(
            ref self: ContractState,
            token_address: ContractAddress,
            token_id: felt252,
            is_accepted: bool,
        ) -> bool {
            let caller = get_contract_address();

            assert(self.accesscontrol.has_role(ADMIN_ROLE, caller), errors::NOT_AUTHORIZED);

            self.token_id_accepted.entry(token_id).write(is_accepted);
            self.token_id_address.entry(token_address).write(token_id);
            self.token_address_per_id.entry(token_id).write(token_address);
            true
        }

        fn set_deposit_vault(
            ref self: ContractState, deposit_vault: ContractAddress, is_deposit_vault_enabled: bool,
        ) -> bool {
            let caller = get_contract_address();
            assert(self.accesscontrol.has_role(ADMIN_ROLE, caller), errors::NOT_AUTHORIZED);

            self.deposit_vault.write(deposit_vault);
            self.is_deposit_vault_enabled.write(is_deposit_vault_enabled);
            true
        }

        fn set_mint_cap(ref self: ContractState, total_mint_cap: u256) -> bool {
            let caller = get_contract_address();
            println!("set_mint_cap");
            println!("caller {:?}", caller);
            // assert(self.accesscontrol.has_role(ADMIN_ROLE, caller), errors::NOT_AUTHORIZED);
            self.total_mint_cap.write(total_mint_cap);
            true
        }
    }

    #[abi(embed_v0)]
    impl IAdminStablecoinVaultImpl of IAdminStablecoinVault<ContractState> {
        fn set_params_collaterization(
            ref self: ContractState,
            total_mint_cap: u256,
            is_under_collateral: bool,
            collateral_debt_ratio: u256,
        ) -> bool {
            let caller = get_contract_address();

            assert(self.accesscontrol.has_role(ADMIN_ROLE, caller), errors::NOT_AUTHORIZED);

            self.total_mint_cap.write(total_mint_cap);
            self.is_under_collateral.write(is_under_collateral);
            self.collateral_debt_ratio.write(collateral_debt_ratio);

            true
        }

        fn set_params_withdraw(
            ref self: ContractState,
            is_withdraw_current_price: bool,
            is_option_mode: bool,
            option_expiry_epoch: u64,
        ) -> bool {
            let caller = get_contract_address();
            assert(self.accesscontrol.has_role(ADMIN_ROLE, caller), errors::NOT_AUTHORIZED);

            self.is_withdraw_current_price.write(is_withdraw_current_price);
            self.is_option_mode.write(is_option_mode);
            self.option_expiry_epoch.write(option_expiry_epoch);

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

            let token_id_address = self.token_id_address.entry(token_address).read();
            assert(!token_id_address.is_zero(), errors::TOKEN_ID_NOT_KNOWN);

            let token_id_accepted = self.token_id_accepted.entry(self.token_id.read()).read();
            assert(token_id_accepted, errors::TOKEN_NOT_ACCEPTED_BY_ID);

            let token_address_per_id = self.token_address_per_id.entry(self.token_id.read()).read();

            assert(token_address_per_id == token_address, errors::TOKEN_ADDRESS_NOT_MATCH);
            assert(!token_id_address.is_zero(), errors::TOKEN_ID_NOT_MATCH);

            let mut fee_amount = 0;
            let fee_deposit_percentage = self.fee_deposit_percentage.read();
            if self.is_fees_deposit.read() {
                fee_amount = amount * fee_deposit_percentage / 10_000;
            }
            let amount_minus_fees = amount - fee_amount;

            let new_total_minted_amount = self.total_minted_amount.read() + amount_minus_fees;

            assert(
                new_total_minted_amount <= self.total_mint_cap.read(), errors::MINT_CAP_EXCEEDED,
            );
            self.total_minted_amount.write(new_total_minted_amount);

            let amount_deposited_per_user = self.deposit_per_user.entry(caller).read();
            let amount_deposited_per_token = self.deposit_per_token.entry(token_address).read();
            let amount_deposited_per_user_token = self
                .deposit_token_per_user
                .entry(caller)
                .entry(token_address)
                .read();
            let new_amount_deposited_per_user = amount_deposited_per_user + amount_minus_fees;
            let new_amount_deposited_per_token = amount_deposited_per_token + amount_minus_fees;
            self.deposit_per_user.entry(caller).write(new_amount_deposited_per_user);
            self.deposit_per_token.entry(token_address).write(new_amount_deposited_per_token);
            self
                .deposit_token_per_user
                .entry(caller)
                .entry(token_address)
                .write(amount_deposited_per_user_token + amount_minus_fees);

            // println!("deposit_amount_per_user_token: {}", deposit_amount_per_user_token);

            let erc20_quote = IERC20Dispatcher { contract_address: token_address };

            if self.is_deposit_vault_enabled.read() && !self.deposit_vault.read().is_zero() {
                if fee_amount > 0 {
                    erc20_quote.transfer_from(caller, self.deposit_vault.read(), fee_amount);
                }
                erc20_quote.transfer_from(caller, self.deposit_vault.read(), amount_minus_fees);
            } else {
                if fee_amount > 0 {
                    erc20_quote.transfer_from(caller, get_contract_address(), fee_amount);
                }
                erc20_quote.transfer_from(caller, get_contract_address(), amount_minus_fees);
            }

            // deducted fees if 1=1
            // TODO fees per token

            let oracle_address = self.pragma_contract.read();
            let oracle_stats_address = self.summary_stats_address.read();
            // let output = get_asset_price_median(oracle_address,
            // DataType::SpotEntry(token_id_address));
            let arrays_sources = array![];
            let sources = arrays_sources.span();
            let output = get_asset_price_average(
                oracle_address, DataType::SpotEntry(token_id_address), sources,
            );
            // println!("price: {}", output.price);
            // println!("decimals: {}", output.decimals);
            // println!("last_updated_timestamp: {}", output.last_updated_timestamp);
            // println!("num_sources_aggregated: {}", output.num_sources_aggregated);

            let price = output.price;
            let decimals = output.decimals;
            let price_with_precision = price * fast_power(10_u128, decimals.try_into().unwrap());

            // println!("price_with_precision: {}", price_with_precision);

            let price_u256: u256 = price_with_precision.try_into().unwrap();
            // println!("price_u256: {}", price_u256);

            // let amount_to_mint = amount - fee_amount;
            let amount_to_mint = amount_minus_fees * price_u256;

            let amount_mint_per_user = self.mint_per_user.entry(caller).read();
            let amount_mint_per_token = self.mint_per_token.entry(token_address).read();
            self.mint_per_user.entry(caller).write(amount_mint_per_user + amount_to_mint);
            self.mint_per_token.entry(token_address).write(amount_mint_per_token + amount_to_mint);

            // let amount_to_mint_precision = amount * price_with_precision;
            // println!("amount_to_mint: {}", amount_to_mint);
            // println!("amount_to_mint_precision: {}", amount_to_mint_precision);
            self.erc20.mint(recipient, amount_to_mint);

            self
                .emit(
                    MintDepositEvent {
                        is_fees_deposit: self.is_fees_deposit.read(),
                        fee_deposit_percentage: fee_deposit_percentage,
                        amount_send: amount,
                        amount_received: amount_to_mint,
                        token_address: token_address,
                        recipient: recipient,
                        caller: caller,
                    },
                );
        }

        fn _withdrawn(
            ref self: ContractState,
            recipient: ContractAddress,
            amount: u256, // amount in stablecoin
            token_address: ContractAddress,
        ) {
            let caller = get_caller_address();

            let token_collateral = self.token_collateral.entry(token_address).read();
            assert(token_collateral.is_accepted, errors::TOKEN_NOT_ACCEPTED);

            let amount_deposited_per_user = self.deposit_token_per_user.entry(caller).entry(token_address).read();
            let amount_minted_per_user = self.mint_per_user.entry(caller).read();
            // assert(amount_deposited_per_user >= amount, errors::NOT_ENOUGH_WITHDRAW_BALANCE);

            let fee_withdraw_percentage = self.fee_withdraw_percentage.read();

            let erc20_quote = IERC20Dispatcher { contract_address: token_address };
            let mut fee_amount = 0;
            if self.is_fees_withdraw.read() {
                fee_amount = amount * fee_withdraw_percentage / 10_000;
            }
            let mut amount_minus_fees = amount - fee_amount;

            let is_withdraw_current_price = self.is_withdraw_current_price.read();
            let is_option_mode = self.is_option_mode.read();
            let option_expiry_epoch = self.option_expiry_epoch.read();

            let token_id_address = self.token_id_address.entry(token_address).read();

            let mut amount_to_withdraw = 0;

            if is_withdraw_current_price && !is_option_mode {
                let oracle_address = self.pragma_contract.read();
                let arrays_sources = array![];
                let sources = arrays_sources.span();
                let output = get_asset_price_average(
                    oracle_address, DataType::SpotEntry(token_id_address), sources,
                );
                let price = output.price;
                let decimals = output.decimals;
                let price_with_precision = price
                    * fast_power(10_u128, decimals.try_into().unwrap());
                let price_u256: u256 = price_with_precision.try_into().unwrap();
                amount_to_withdraw = amount_minus_fees * price_u256;
            } else {
                let oracle_address = self.pragma_contract.read();
                let arrays_sources = array![];
                let sources = arrays_sources.span();
                let output = get_asset_price_average(
                    oracle_address, DataType::SpotEntry(token_id_address), sources,
                );
                let price = output.price;
                let decimals = output.decimals;
                let price_with_precision = price
                    * fast_power(10_u128, decimals.try_into().unwrap());
                let price_u256: u256 = price_with_precision.try_into().unwrap();
                amount_to_withdraw = amount_minus_fees * price_u256;
            }

            let total_deposited_per_user_token = self
                .deposit_token_per_user
                .entry(caller)
                .entry(token_address)
                .read();

            assert(amount_minted_per_user >= amount_to_withdraw, errors::NOT_ENOUGH_WITHDRAW_BALANCE);

            assert(
                total_deposited_per_user_token >= amount_minus_fees,
                errors::NOT_ENOUGH_WITHDRAW_BALANCE,
            );

            self
                .deposit_token_per_user
                .entry(caller)
                .entry(token_address)
                .write(total_deposited_per_user_token - amount_minus_fees);
            self.mint_per_user.entry(caller).write(amount_minted_per_user - amount_to_withdraw);

            println!("amount_minus_fees: {}", amount_minus_fees);
            println!("amount_to_withdraw: {}", amount_to_withdraw);
            println!("amount_minted_per_user: {}", amount_minted_per_user);
            println!("amount_deposited_per_user: {}", amount_deposited_per_user);

            if self.is_deposit_vault_enabled.read() && !self.deposit_vault.read().is_zero() {
                // println!("withdraw vault transfer");
                // println!("deposit_vault.transfer_from_operator(token_address, amount_minus_fees,
                // recipient);");
                let address_vault = self.deposit_vault.read();
                let deposit_vault = IDepositVaultDispatcher { contract_address: address_vault };
                if fee_amount > 0 {
                    deposit_vault
                        .transfer_from_operator(token_address, fee_amount, get_contract_address());
                }
                deposit_vault.transfer_from_operator(token_address, amount_minus_fees, recipient);
            } else {
                if fee_amount > 0 {
                    erc20_quote.transfer(get_contract_address(), fee_amount);
                }
                erc20_quote.transfer(recipient, amount_minus_fees);
            }

            self.erc20.burn(caller, amount_to_withdraw);

            self
                .emit(
                    WithdrawnEvent {
                        is_fees_deposit: self.is_fees_deposit.read(),
                        fee_withdraw_percentage: fee_withdraw_percentage,
                        amount_send: amount,
                        amount_received: amount,
                        token_address: token_address,
                        recipient: recipient,
                        caller: caller,
                    },
                );
        }
    }

    #[abi(embed_v0)]
    impl IViewMintStablecoinImpl of IViewMintStablecoin<ContractState> {
        fn get_mint_per_user(ref self: ContractState, user: ContractAddress) -> u256 {
            self.mint_per_user.entry(user).read()
        }

        fn get_mint_per_token(ref self: ContractState, token_address: ContractAddress) -> u256 {
            self.mint_per_token.entry(token_address).read()
        }

        fn get_deposit_user_balance(
            ref self: ContractState, user: ContractAddress, token_address: ContractAddress,
        ) -> u256 {
            self.deposit_token_per_user.entry(user).entry(token_address).read()
        }

        fn get_total_mint_cap(ref self: ContractState) -> u256 {
            self.total_mint_cap.read()
        }

        fn get_price_of_token(
            ref self: ContractState, token_id: felt252, token_address: ContractAddress,
        ) -> u128 {
            let token_id_address = self.token_id_address.entry(token_address).read();
            let oracle_address = self.pragma_contract.read();
            let arrays_sources = array![];
            let sources = arrays_sources.span();
            let output = get_asset_price_average(
                oracle_address, DataType::SpotEntry(token_id_address), sources,
            );
            output.price
        }


        fn get_price_response(
            ref self: ContractState, token_id: felt252, token_address: ContractAddress,
        ) -> PragmaPricesResponse {
            let token_id_address = self.token_id_address.entry(token_address).read();
            let oracle_address = self.pragma_contract.read();
            let arrays_sources = array![];
            let sources = arrays_sources.span();
            let output = get_asset_price_average(
                oracle_address, DataType::SpotEntry(token_id_address), sources,
            );
            output
        }

        fn get_total_minted(ref self: ContractState) -> u256 {
            self.total_minted_amount.read()
        }
    }
}
