#[cfg(test)]
pub mod stablecoin_tests {
    use afk_ignite::interfaces::stablecoin::{// IAdminVault, IAdminVaultDispatcher, IAdminVaultDispatcherTrait, IStablecoin,
    IStablecoinDispatcherTrait, IStablecoinDispatcher};
    use alexandria_math::fast_power::fast_power;
    use core::num::traits::Zero;
    use core::option::OptionTrait;
    use core::result::ResultTrait;
    // use openzeppelin::token::erc20::interface::{IERC20, IERC20Dispatcher, IERC20DispatcherTrait};
    // use openzeppelin::token::erc20::interface::{ERC20ABIDispatcher, ERC20ABIDispatcherTrait};
    use openzeppelin::token::erc20::interface::{
        ERC20ABIDispatcher, ERC20ABIDispatcherTrait, IERC20, IERC20Dispatcher,
        IERC20DispatcherTrait, IERC20MetadataDispatcher,
    };
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
        initial_recipient: ContractAddress,
        initial_supply: u256,
        decimals: u8,
        name: ByteArray,
        symbol: ByteArray,
    ) -> ContractAddress {
        let mut calldata = array![];
        // calldata.append('MockToken'.try_into().unwrap());
        // calldata.append('MTK'.try_into().unwrap());
        // calldata.append(initial_supply.try_into().unwrap());
        // calldata.append(initial_recipient.try_into().unwrap());
        // 'MockToken'.serialize(ref calldata);
        // 'MTK'.serialize(ref calldata);

        name.serialize(ref calldata);
        symbol.serialize(ref calldata);
        initial_supply.serialize(ref calldata);
        initial_recipient.serialize(ref calldata);

        let contract = declare("MockERC20").unwrap().contract_class();
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        contract_address
    }


    fn deploy_stable_mint(
        initial_recipient: ContractAddress,
        initial_supply: u256,
        token_address: ContractAddress,
        decimals: u8,
        name: ByteArray,
        symbol: ByteArray,
    ) -> ContractAddress {
        let mut calldata = array![];

        name.serialize(ref calldata);
        symbol.serialize(ref calldata);
        initial_recipient.serialize(ref calldata);
        decimals.serialize(ref calldata);
        token_address.serialize(ref calldata);

        // calldata.append('aligned BTC'.try_into().unwrap());
        // calldata.append('aBTC'.try_into().unwrap());

        // calldata.append(initial_supply.try_into().unwrap());
        // calldata.append(initial_recipient.try_into().unwrap());
        // calldata.append(18);
        // calldata.append(token_address.try_into().unwrap());

        let contract = declare("Stablecoin").unwrap().contract_class();
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        contract_address
    }

    fn context(whitelist: bool) -> (IStablecoinDispatcher, IERC20Dispatcher) {
        let token_deposit_address = deploy_token_collateral(
            OWNER, 1_000_000_u256 * fast_power(10, 18), 18, "MockToken", "MTK",
        );
        println!("token_deposit_address: {:?}", token_deposit_address);

        let token_dispatcher = IERC20Dispatcher { contract_address: token_deposit_address };
        let contract_address = deploy_stable_mint(
            OWNER,
            1_000_000_u256 * fast_power(10, 18),
            token_deposit_address,
            18,
            "aligned BTC",
            "aBTC",
        );
        println!("contract_address: {:?}", contract_address);

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
        dispatcher
            .deposit(OWNER.try_into().unwrap(), 100_000_u256 * fast_power(10, 18), token_address);

        let token_vault = IERC20Dispatcher { contract_address: dispatcher.contract_address };

        println!("token_vault.contract_address: {:?}", token_vault.contract_address);
        let balance_of_user = token_vault.balance_of(OWNER);

        println!("balance_of_user: {}", balance_of_user);
        assert_eq!(balance_of_user, 100_000_u256 * fast_power(10, 18));
        cheat_caller_address(dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1));

        dispatcher
            .withdraw(OWNER.try_into().unwrap(), 100_000_u256 * fast_power(10, 18), token_address);
        let balance_of_user_after = token_vault.balance_of(OWNER);
        println!("balance_of_user_after: {}", balance_of_user_after);
        assert_eq!(balance_of_user_after, 0);
        assert_eq!(token_dispatcher.balance_of(OWNER), user_balance);
    }
}
