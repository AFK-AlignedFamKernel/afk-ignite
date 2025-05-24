#[cfg(test)]
pub mod stablecoin_tests {
    use afk_ignite::interfaces::stablecoin::{
        // IAdminVault, IAdminVaultDispatcher, IAdminVaultDispatcherTrait, IStablecoin,
        IStablecoinDispatcherTrait,
        IStablecoinDispatcher,
    };
    use alexandria_math::fast_power::fast_power;
    use core::num::traits::Zero;
    use core::option::OptionTrait;
    use core::result::ResultTrait;
    // use openzeppelin::token::erc20::interface::{IERC20, IERC20Dispatcher, IERC20DispatcherTrait};
    // use openzeppelin::token::erc20::interface::{ERC20ABIDispatcher, ERC20ABIDispatcherTrait};
    use crate::interfaces::erc20::{IERC20, IERC20Dispatcher, IERC20DispatcherTrait};
    use snforge_std::{
        CheatSpan, ContractClassTrait, DeclareResultTrait, EventSpyAssertionsTrait,
        cheat_block_timestamp, cheat_caller_address, declare, spy_events,
        start_cheat_block_timestamp, stop_cheat_block_timestamp, stop_cheat_caller_address,
    };
    use starknet::{ClassHash, ContractAddress};

    const OWNER: ContractAddress = 'OWNER'.try_into().unwrap();
    const ADMIN: ContractAddress = 'ADMIN'.try_into().unwrap();
    const PROTOCOL: ContractAddress = 'PROTOCOL'.try_into().unwrap();
    const USER: ContractAddress = 'USER'.try_into().unwrap();
    const BUYER: ContractAddress = 'BUYER'.try_into().unwrap();

    fn deploy_token_collateral(
        initial_recipient: ContractAddress, initial_supply: u256,
    ) -> ContractAddress {
        let mut calldata = array![];
        calldata.append('MockToken');
        calldata.append('MTK');
        calldata.append(18.try_into().unwrap());
        calldata.append(initial_supply.try_into().unwrap());
        calldata.append(initial_recipient.try_into().unwrap());
        let contract = declare("MockERC20").unwrap().contract_class();
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        contract_address
    }


    fn deploy_stable_mint(
        initial_recipient: ContractAddress, initial_supply: u256, token_address: ContractAddress,
    ) -> ContractAddress {
        let mut calldata = array![];
        calldata.append('aBTC');
        calldata.append('aBTC');
        calldata.append(initial_supply.try_into().unwrap());
        calldata.append(initial_recipient.try_into().unwrap());
        calldata.append(18);
        calldata.append(token_address.try_into().unwrap());

        let contract = declare("Stablecoin").unwrap().contract_class();
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        contract_address
    }

    fn context(whitelist: bool) -> (IStablecoinDispatcher, IERC20Dispatcher) {
        let token_deposit_address = deploy_token_collateral(
            OWNER, 1_000_000_u256 * fast_power(10, 18),
        );

        let token_dispatcher = IERC20Dispatcher { contract_address: token_deposit_address };
        let contract_address = deploy_stable_mint(
            OWNER, 1_000_000_u256 * fast_power(10, 18), 
            token_deposit_address,
        );
        let dispatcher = IStablecoinDispatcher { contract_address };
        cheat_caller_address(contract_address, USER, CheatSpan::TargetCalls(1));
        (dispatcher, token_dispatcher)
    }

    #[test]
    fn test_stablecoin_mint() {
        let (dispatcher, token_dispatcher) = context(false);

        let user_balance = token_dispatcher.balance_of(OWNER.try_into().unwrap());
        cheat_caller_address(token_dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1));
      
        token_dispatcher.approve(dispatcher.contract_address, user_balance);

        cheat_caller_address(dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1));

        let token_address = token_dispatcher.contract_address;
        dispatcher.deposit(OWNER.try_into().unwrap(), 100_000_u256 * fast_power(10, 18), token_address);
        
        // let token_vault = IERC20Dispatcher { contract_address: dispatcher.contract_address };
        
        // let balance_of_user = token_vault.balance_of(USER);
        
        // println!("balance_of_user: {}", balance_of_user);
        // assert_eq!(balance_of_user, 100_000_u256 * fast_power(10, 18));
       
        // dispatcher.withdraw(USER.try_into().unwrap(), 100_000_u256 * fast_power(10, 18), token_address);
        // let balance_of_user_after = token_vault.balance_of(USER);
        // assert_eq!(balance_of_user_after, 0);
        // assert_eq!(token_dispatcher.balance_of(USER), user_balance);
    }
}
