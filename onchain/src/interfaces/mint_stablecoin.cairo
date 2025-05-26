use starknet::ContractAddress;
use pragma_lib::abi::{
    IPragmaABISafeDispatcherTrait,
    PragmaPricesResponse,
};
pub const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");
pub const ADMIN_ROLE: felt252 = selector!("ADMIN_ROLE");
pub const OPERATOR_ROLE: felt252 = selector!("OPERATOR_ROLE");

#[starknet::interface]
pub trait IERC20Basic<TContractState> {
    fn name(self: @TContractState) -> ByteArray;
    fn symbol(self: @TContractState) -> ByteArray;
    fn decimals(self: @TContractState) -> u8;
}


#[starknet::interface]
pub trait IAdminVault<TContractState> {
    fn set_token_collateral(
        ref self: TContractState,
        token_address: ContractAddress,
        is_accepted: bool,
        is_fees_deposit: bool,
        is_fees_withdraw: bool,
        fee_deposit_percentage: u256,
        fee_withdraw_percentage: u256,
        token_id: felt252,
    ) -> bool;
    fn set_fees(
        ref self: TContractState,
        is_fees_deposit: bool,
        fee_deposit_percentage: u256,
        is_fees_withdraw: bool,
        fee_withdraw_percentage: u256,
    ) -> bool;
    fn set_token_accepted(
        ref self: TContractState, token_address: ContractAddress, is_accepted: bool,
    ) -> bool;

    fn set_token_id(
        ref self: TContractState,
        token_address: ContractAddress,
        token_id: felt252,
        is_accepted: bool,
    ) -> bool;


    fn set_deposit_vault(
        ref self: TContractState, deposit_vault: ContractAddress, is_deposit_vault_enabled: bool,
    ) -> bool;

    fn set_mint_cap(
        ref self: TContractState,
        total_mint_cap: u256,
    ) -> bool;
}

#[starknet::interface]
pub trait IViewMintStablecoin<TContractState> {
    fn get_mint_per_user(
        ref self: TContractState,
        user: ContractAddress,
    ) -> u256;

    fn get_mint_per_token(
        ref self: TContractState,
        token_address: ContractAddress,
    ) -> u256;

    fn get_deposit_user_balance(
        ref self: TContractState,
        user: ContractAddress,
        token_address: ContractAddress,
    ) -> u256;

    fn get_total_mint_cap(
        ref self: TContractState,
    ) -> u256;


    fn get_price_of_token(
        ref self: TContractState,
        token_id: felt252,
        token_address: ContractAddress,
    ) -> u128;

    fn get_price_response(
        ref self: TContractState,
        token_id: felt252,
        token_address: ContractAddress,
    ) -> PragmaPricesResponse;

    fn get_total_minted(
        ref self: TContractState,
    ) -> u256;
}


#[starknet::interface]
pub trait IAdminStablecoinVault<TContractState> {

    fn set_params_collaterization(
        ref self: TContractState,
        total_mint_cap:u256,
        is_under_collateral:bool,
        collateral_debt_ratio:u256,
    ) -> bool;


    fn set_params_withdraw(
        ref self: TContractState,
        is_withdraw_current_price:bool,
        is_option_mode:bool,
        option_expiry_epoch:u64,
    ) -> bool;

}

#[starknet::interface]
pub trait IMintStablecoin<TContractState> {
    fn deposit(
        ref self: TContractState,
        recipient: ContractAddress,
        amount: u256,
        token_address: ContractAddress,
    ) -> bool;


    fn withdraw(
        ref self: TContractState,
        recipient: ContractAddress,
        amount: u256,
        token_address: ContractAddress,
    ) -> bool;
}

#[derive(Drop, starknet::Store, Serde, Copy)]
pub struct TokenCollateral {
    pub token_address: ContractAddress,
    pub is_accepted: bool,
    pub is_fees_deposit: bool,
    pub is_fees_withdraw: bool,
    pub fee_deposit_percentage: u256,
    pub fee_withdraw_percentage: u256,
    pub token_id: felt252,
}

#[derive(Drop, starknet::Event, Serde, Copy)]
pub struct MintDepositEvent {
    pub is_fees_deposit: bool,
    pub fee_deposit_percentage: u256,
    pub amount_send: u256,
    pub amount_received: u256,
    pub token_address: ContractAddress,
    pub recipient: ContractAddress,
    pub caller: ContractAddress,
}


#[derive(Drop, starknet::Event, Serde, Copy)]
pub struct WithdrawnEvent {
    pub is_fees_deposit: bool,
    pub fee_withdraw_percentage: u256,
    pub amount_send: u256,
    pub amount_received: u256,
    pub token_address: ContractAddress,
    pub recipient: ContractAddress,
    pub caller: ContractAddress,
}

#[derive(Drop, starknet::Event, Serde, Copy)]
pub struct AdminVaultEvent {
    pub is_fees_deposit: bool,
    pub fee_deposit_percentage: u256,
    pub is_fees_withdraw: bool,
    pub fee_withdraw_percentage: u256,
}
