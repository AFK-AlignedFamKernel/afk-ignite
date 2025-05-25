#[cfg(test)]
pub mod pegged_tests {
    use afk_ignite::interfaces::deposit_vault::{
        IDepositVaultDispatcher, IDepositVaultDispatcherTrait,
    };
    use afk_ignite::interfaces::peggedcoin::{
        IAdminVault, IAdminVaultDispatcher, IAdminVaultDispatcherTrait, IPeggedCoinDispatcher,
        IPeggedCoinDispatcherTrait,
    };
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

    fn deploy_deposit_vault(initial_recipient: ContractAddress) -> ContractAddress {
        let mut calldata = array![];
        initial_recipient.serialize(ref calldata);

        let contract = declare("DepositVault").unwrap().contract_class();
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        contract_address
    }

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

        let contract = declare("PeggedCoin").unwrap().contract_class();
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        contract_address
    }

    fn context(
        whitelist: bool,
    ) -> (IPeggedCoinDispatcher, IERC20Dispatcher, IDepositVaultDispatcher) {
        let token_deposit_address = deploy_token_collateral(
            OWNER, 1_000_000_u256 * fast_power(10, 18), 18, "MockToken", "MTK",
        );

        let collateral_token_dispatcher = IERC20Dispatcher {
            contract_address: token_deposit_address,
        };
        let contract_address = deploy_stable_mint(
            OWNER,
            1_000_000_u256 * fast_power(10, 18),
            token_deposit_address,
            18,
            "aligned BTC",
            "aBTC",
        );

        let dispatcher = IPeggedCoinDispatcher { contract_address };
        let deposit_vault_address = deploy_deposit_vault(OWNER);

        let deposit_vault_dispatcher = IDepositVaultDispatcher {
            contract_address: deposit_vault_address,
        };
        cheat_caller_address(
            deposit_vault_dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1),
        );
        deposit_vault_dispatcher.set_operator(contract_address);
        cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));

        (dispatcher, collateral_token_dispatcher, deposit_vault_dispatcher)
    }

    #[test]
    fn test_peggedcoin_mint() {
        let (dispatcher, collateral_token_dispatcher, deposit_vault_dispatcher) = context(false);

        let user_balance = collateral_token_dispatcher.balance_of(OWNER.try_into().unwrap());
        cheat_caller_address(
            collateral_token_dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1),
        );

        collateral_token_dispatcher.approve(dispatcher.contract_address, user_balance);

        cheat_caller_address(dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1));

        let token_address = collateral_token_dispatcher.contract_address;
        dispatcher
            .deposit(OWNER.try_into().unwrap(), 100_000_u256 * fast_power(10, 18), token_address);

        let token_vault = IERC20Dispatcher { contract_address: dispatcher.contract_address };

        let balance_of_user = token_vault.balance_of(OWNER);

        println!("balance_of_user: {}", balance_of_user);
        assert_eq!(balance_of_user, 100_000_u256 * fast_power(10, 18));

        let balance_of_deposit = collateral_token_dispatcher
            .balance_of(dispatcher.contract_address);
        println!("balance_of_deposit: {}", balance_of_deposit);
        assert_eq!(balance_of_deposit, 100_000_u256 * fast_power(10, 18));

        cheat_caller_address(dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1));

        dispatcher
            .withdraw(OWNER.try_into().unwrap(), 100_000_u256 * fast_power(10, 18), token_address);
        let balance_of_user_after = token_vault.balance_of(OWNER);
        println!("balance_of_user_after: {}", balance_of_user_after);
        assert_eq!(balance_of_user_after, 0);
        assert_eq!(collateral_token_dispatcher.balance_of(OWNER), user_balance);
    }

    #[test]
    fn test_peggedcoin_mint_multi_user() {
        let (dispatcher, collateral_token_dispatcher, deposit_vault_dispatcher) = context(false);
        cheat_caller_address(
            collateral_token_dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1),
        );

        collateral_token_dispatcher
            .transfer(USER.try_into().unwrap(), 100_000_u256 * fast_power(10, 18));
        let user_balance = collateral_token_dispatcher.balance_of(USER.try_into().unwrap());

        cheat_caller_address(
            collateral_token_dispatcher.contract_address, USER, CheatSpan::TargetCalls(1),
        );

        collateral_token_dispatcher.approve(dispatcher.contract_address, user_balance);

        cheat_caller_address(dispatcher.contract_address, USER, CheatSpan::TargetCalls(1));

        let token_address = collateral_token_dispatcher.contract_address;
        dispatcher
            .deposit(USER.try_into().unwrap(), 100_000_u256 * fast_power(10, 18), token_address);

        let token_vault = IERC20Dispatcher { contract_address: dispatcher.contract_address };

        let balance_of_user = token_vault.balance_of(USER);

        println!("balance_of_user: {}", balance_of_user);
        assert_eq!(balance_of_user, 100_000_u256 * fast_power(10, 18));

        let balance_of_deposit = collateral_token_dispatcher
            .balance_of(dispatcher.contract_address);
        println!("balance_of_deposit: {}", balance_of_deposit);
        assert_eq!(balance_of_deposit, 100_000_u256 * fast_power(10, 18));

        cheat_caller_address(dispatcher.contract_address, USER, CheatSpan::TargetCalls(1));

        dispatcher
            .withdraw(USER.try_into().unwrap(), 100_000_u256 * fast_power(10, 18), token_address);
        let balance_of_user_after = token_vault.balance_of(USER);
        println!("balance_of_user_after: {}", balance_of_user_after);
        assert_eq!(balance_of_user_after, 0);
        assert_eq!(collateral_token_dispatcher.balance_of(USER), user_balance);
    }

    #[test]
    fn test_peggedcoin_with_vault() {
        let (dispatcher, collateral_token_dispatcher, deposit_vault_dispatcher) = context(false);

        let user_balance = collateral_token_dispatcher.balance_of(OWNER.try_into().unwrap());
        println!("user_balance: {}", user_balance);
        cheat_caller_address(
            collateral_token_dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1),
        );

        collateral_token_dispatcher.approve(dispatcher.contract_address, user_balance);

        cheat_caller_address(dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1));

        let token_address = collateral_token_dispatcher.contract_address;

        stop_cheat_caller_address(dispatcher.contract_address);

        let dispatcher_admin = IAdminVaultDispatcher {
            contract_address: dispatcher.contract_address,
        };
        cheat_caller_address(dispatcher_admin.contract_address, OWNER, CheatSpan::TargetCalls(3));

        println!(" try set vault ");
        dispatcher_admin.set_deposit_vault(deposit_vault_dispatcher.contract_address, true);
        println!(" set vault success ");
        cheat_caller_address(dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1));

        dispatcher
            .deposit(OWNER.try_into().unwrap(), 100_000_u256 * fast_power(10, 18), token_address);

        let token_vault = IERC20Dispatcher { contract_address: dispatcher.contract_address };

        let balance_of_user = token_vault.balance_of(OWNER);

        let balance_of_deposit = collateral_token_dispatcher
            .balance_of(deposit_vault_dispatcher.contract_address);
        println!("balance_of_deposit to vault: {}", balance_of_deposit);
        assert_eq!(balance_of_deposit, 100_000_u256 * fast_power(10, 18));

        println!("balance_of_user vault: {}", balance_of_user);
        assert_eq!(balance_of_user, 100_000_u256 * fast_power(10, 18));
        cheat_caller_address(dispatcher.contract_address, OWNER, CheatSpan::TargetCalls(1));

        dispatcher
            .withdraw(OWNER.try_into().unwrap(), 100_000_u256 * fast_power(10, 18), token_address);
        let balance_of_user_after = token_vault.balance_of(OWNER);
        let balance_of_deposit_after = token_vault
            .balance_of(deposit_vault_dispatcher.contract_address);
        println!("balance_of_user_after: {}", balance_of_user_after);
        println!("balance_of_deposit_after: {}", balance_of_deposit_after);

        let balance_collateral_of_deposit_after_fees = collateral_token_dispatcher
            .balance_of(deposit_vault_dispatcher.contract_address);
        println!(
            "balance_collateral_of_deposit_after_fees: {}",
            balance_collateral_of_deposit_after_fees,
        );

        let balance_collateral_of_deposit_after = collateral_token_dispatcher.balance_of(OWNER);
        println!("balance_collateral_of_deposit_after: {}", balance_collateral_of_deposit_after);

        assert_eq!(balance_of_user_after, 0);
        assert_eq!(balance_of_deposit_after, 0);
        assert_eq!(collateral_token_dispatcher.balance_of(OWNER), user_balance);
    }
}
