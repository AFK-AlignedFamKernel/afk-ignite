use std::hash::poseidon;

// Helper to simulate ElGamal subtraction (simplified representation)
// Normally you'd use EC point operations or simulate them
fn subtract_cipher(c1a: Field, c2a: Field, c1b: Field, c2b: Field) -> (Field, Field) {
    (c1a - c1b, c2a - c2b)
}

fn add_cipher(c1a: Field, c2a: Field, c1b: Field, c2b: Field) -> (Field, Field) {
    (c1a + c1b, c2a + c2b)
}

fn main(
    old_sender_c1: pub Field,
    old_sender_c2: pub  Field,
    old_receiver_c1: pub Field,
    old_receiver_c2: pub Field,
    new_sender_c1: pub Field,
    new_sender_c2: pub Field,
    new_receiver_c1: pub Field,
    new_receiver_c2: pub Field,

    secret_scalar: Field,
    transfer_amount: Field,
    receiver_pubkey_x: Field,
    receiver_pubkey_y: Field
) {
    // Compute transfer_cipher off-chain: Enc(amount) = (g^r, m*pk^r)
    // You commit to that amount in the proof, just check the delta logic

    let (expected_sender_c1, expected_sender_c2) = subtract_cipher(
        old_sender_c1, old_sender_c2,
        new_sender_c1, new_sender_c2
    );

    let (expected_receiver_c1, expected_receiver_c2) = subtract_cipher(
        new_receiver_c1, new_receiver_c2,
        old_receiver_c1, old_receiver_c2
    );

    assert(expected_sender_c1 == expected_receiver_c1);
    assert(expected_sender_c2 == expected_receiver_c2);

    // Optional: add nullifier to prevent double-transfer
    let nullifier = poseidon::bn254::hash_4([secret_scalar, transfer_amount, receiver_pubkey_x, receiver_pubkey_y]);


    // pub nullifier: Field;
    // assert(nullifier == expected_nullifier);
}


#[test]
fn test_private_transfer_cipherflow() {
    // Simulated ciphertext values for sender and receiver
    // Normally: these are elliptic curve point components, but simplified here

    let old_sender_c1 = 100;
    let old_sender_c2 = 200;

    let new_sender_c1 = 70;
    let new_sender_c2 = 160;

    let old_receiver_c1 = 10;
    let old_receiver_c2 = 20;

    let new_receiver_c1 = 40;
    let new_receiver_c2 = 60;

    // Simulate secret + transfer logic
    let secret_scalar = 123;
    let transfer_amount = 10;
    let receiver_pubkey_x = 55;
    let receiver_pubkey_y = 88;

    main(
        old_sender_c1,
        old_sender_c2,
        old_receiver_c1,
        old_receiver_c2,
        new_sender_c1,
        new_sender_c2,
        new_receiver_c1,
        new_receiver_c2,
        secret_scalar,
        transfer_amount,
        receiver_pubkey_x,
        receiver_pubkey_y,
    );
}

#[test]
fn test_private_transfer_invalid_state_should_fail() {
    // Setup with incorrect new_sender and new_receiver values
    // This will break the delta equality assertion

    let old_sender_c1 = 100;
    let old_sender_c2 = 200;

    let new_sender_c1 = 80; // should be 70
    let new_sender_c2 = 160;

    let old_receiver_c1 = 10;
    let old_receiver_c2 = 20;

    let new_receiver_c1 = 40;
    let new_receiver_c2 = 60;

    let secret_scalar = 123;
    let transfer_amount = 10;
    let receiver_pubkey_x = 55;
    let receiver_pubkey_y = 88;

    // This should fail due to delta mismatch
    main(
        old_sender_c1,
        old_sender_c2,
        old_receiver_c1,
        old_receiver_c2,
        new_sender_c1,
        new_sender_c2,
        new_receiver_c1,
        new_receiver_c2,
        secret_scalar,
        transfer_amount,
        receiver_pubkey_x,
        receiver_pubkey_y,
    );
}
