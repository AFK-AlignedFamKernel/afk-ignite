use std::hash::poseidon;

fn main(
    c1: pub Field,
    c2: pub Field,
    pubkey: pub Field,
    privkey: Field,
    balance: pub Field
) {
    // Simulate shared secret: s = privkey * c1 (offchain in real ElGamal)
    let shared_secret = c1 * privkey;

    // mG = c2 - s
    let mG = c2 - shared_secret;

    // Simulate the encoding of balance as balance * G (G is abstracted out)
    let balance_encoded = balance * 1; // G = 1 for simplification

    assert(mG == balance_encoded);

    // Optional: validate that pubkey = privkey * G
    let computed_pubkey = privkey * 1;
    assert(pubkey == computed_pubkey);
}


#[test]
fn test_prove_balance_field() {
    // Simulated ElGamal ciphertext (c1, c2)
    // pubkey = sk * 1 = 3 * 1 = 3
    // shared_secret = sk * c1 = 3 * 3 = 9
    // mG = c2 - shared_secret = 35 - 9 = 26
    // so balance = 26

    let c1 = 3;
    let c2 = 35;
    let pubkey = 3;
    let privkey = 3;
    let balance = 26;

    main(c1, c2, pubkey, privkey, balance);
} 
