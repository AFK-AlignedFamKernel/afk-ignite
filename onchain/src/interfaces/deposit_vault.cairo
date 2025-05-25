use starknet::ContractAddress;

pub const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");
pub const ADMIN_ROLE: felt252 = selector!("ADMIN_ROLE");
pub const OPERATOR_ROLE: felt252 = selector!("OPERATOR_ROLE");

#[starknet::interface]
pub trait IDepositVault<TContractState> {
    fn set_operator(ref self: TContractState, operator: ContractAddress);
    fn transfer_from_operator(ref self: TContractState, token_address: ContractAddress, amount: u256, recipient: ContractAddress) -> bool;
}