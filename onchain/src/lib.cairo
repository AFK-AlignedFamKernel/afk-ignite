pub mod mock_erc20;
pub mod peggedcoin;
pub mod oracle;
pub mod mint_stablecoin;
pub mod deposit_vault;
pub mod errors;

pub mod interfaces {
    pub mod peggedcoin;
    pub mod mint_stablecoin;
    pub mod deposit_vault;
    // pub mod erc20;
}

pub mod tests {
    pub mod peggedcoin_tests;
}