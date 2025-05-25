"use client";
import { useEffect, useState } from 'react';
// import {
//     init,
//     launchModal,
//     launchPaymentModal,
//     requestProvider,
// } from '@getalby/bitcoin-connect';

import { Button, PayButton, init, launchModal, launchPaymentModal, closeModal, requestProvider, Connect, Payment } from '@getalby/bitcoin-connect-react';

export default function AlbyBitcoinConnect() {

    const [invoiceString, setInvoiceString] = useState<string | null>(null);
    const [preimage, setPreimage] = useState<string | null>(null);
    const [invoice, setInvoice] = useState<string | null>(null);
    useEffect(() => {
        init({
            appName: 'AFK Ignite',
        });
    }, []);

    const fetchInvoice = async () => {
        const weblnProvider = await requestProvider();
        const { invoice } = await weblnProvider.fetchInvoice(invoiceString);
        return invoice;
    }

    return (
        <div>
            <button onClick={() => launchModal()}>Connect</button>
            <button onClick={() => launchPaymentModal({
                invoice: invoiceString,
                // amount: 1000,
                // description: 'AFK Ignite',
                // onSuccess: (preimage) => {
                //     console.log(preimage);
                // },
            })}>Send Payment</button>
            <button onClick={async () => {
                const weblnProvider = await requestProvider();
                const { preimage } = await weblnProvider.sendPayment("lnbc...")
            }}>
                Request WebLN provider
            </button>

            {invoiceString && (

                <Payment invoice={invoiceString}
                    onPaid={(response) => alert("Paid! " + response.preimage)}
                    payment={{ preimage: 'my-preimage' }}
                // onClose={() => {
                //     console.log("closed");
                // }}
                />
            )}

            {invoiceString && (
                <PayButton invoice={invoiceString} onClick={async () => {
                    const invoice = await fetchInvoice();
                    // setInvoiceString(invoice)
                }} onPaid={(response) => alert("Paid! " + response.preimage)} payment={{ preimage: 'my-preimage' }} />

            )}
            <Connect />


        </div>
    );
}