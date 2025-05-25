use starknet::ContractAddress;
use pragma_lib::abi::{
    ISummaryStatsABIDispatcher, ISummaryStatsABIDispatcherTrait,
    IPragmaABIDispatcher, IPragmaABIDispatcherTrait,
    IPragmaABISafeDispatcherTrait,
    PragmaPricesResponse,
};
use pragma_lib::types::{AggregationMode, DataType};
use starknet::get_block_timestamp;
use starknet::contract_address::contract_address_const;

#[starknet::interface]
trait IOracle<TContractState> {
    fn get_asset_price(self: @TContractState, asset_id: felt252) -> u128;
}


pub fn get_asset_price_average(oracle_address: ContractAddress, asset : DataType, sources : Span<felt252>) -> PragmaPricesResponse  {
    let oracle_dispatcher = IPragmaABIDispatcher{contract_address : oracle_address};
    let output : PragmaPricesResponse= oracle_dispatcher.get_data_for_sources(asset, AggregationMode::Mean(()), sources);

    return output;
}

pub fn get_asset_conversion_rate(oracle_address: ContractAddress, asset : DataType) -> u128  {
    let oracle_dispatcher = IPragmaABIDispatcher{contract_address : oracle_address};
    let output : PragmaPricesResponse= oracle_dispatcher.get_data(asset,AggregationMode::ConversionRate);

    return output.price;
}

pub fn get_asset_price_median(oracle_address: ContractAddress, asset : DataType) -> PragmaPricesResponse  {
    let oracle_dispatcher = IPragmaABIDispatcher{contract_address : oracle_address};
    let output : PragmaPricesResponse= oracle_dispatcher.get_data(asset, AggregationMode::Median(()));
    return output;
}

pub fn compute_volatility(data_type: DataType, aggregation_mode: AggregationMode) -> u128 {
    let SUMMARY_STATS_ADDRESS: ContractAddress =
        contract_address_const::<0x6421fdd068d0dc56b7f5edc956833ca0ba66b2d5f9a8fea40932f226668b5c4>();

    let start_tick = starknet::get_block_timestamp() - 604800;
    let end_tick = starknet::get_block_timestamp();

    let num_samples = 200;
    let summary_dispatcher = ISummaryStatsABIDispatcher { contract_address: SUMMARY_STATS_ADDRESS };
    let (volatility, decimals) = summary_dispatcher
        .calculate_volatility(data_type, start_tick, end_tick, num_samples, aggregation_mode);

    return volatility; // will return the volatility multiplied by 10^decimals
}



pub fn compute_twap(data_type : DataType, aggregation_mode : AggregationMode) -> u128 {
    let SUMMARY_STATS_ADDRESS: ContractAddress =
        contract_address_const::<0x6421fdd068d0dc56b7f5edc956833ca0ba66b2d5f9a8fea40932f226668b5c4>();
    let start_time = 1691315416; // or any wanted start time
    let end_tick = get_block_timestamp();
    let time = end_tick - start_time;
    let summary_dispatcher = ISummaryStatsABIDispatcher { contract_address: SUMMARY_STATS_ADDRESS};
    let (twap, decimals) = summary_dispatcher.calculate_twap(
        data_type,
        aggregation_mode,
        time, // duration
        start_time, // beginning of the twap
    );
    return twap; // will return the twap multiplied by 10^decimals
}
