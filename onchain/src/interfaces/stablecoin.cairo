use starknet::ContractAddress;

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
}


#[starknet::interface]
pub trait IStablecoin<TContractState> {
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
    pub fee_deposit_percentage: u256,
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
