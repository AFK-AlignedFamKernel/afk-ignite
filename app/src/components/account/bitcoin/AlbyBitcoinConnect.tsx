"use client";
import { useEffect, useState } from 'react';
// import {
//     init,
//     launchModal,
//     launchPaymentModal,
//     requestProvider,
// } from '@getalby/bitcoin-connect';

import { Button, PayButton, init, launchModal, launchPaymentModal, closeModal, requestProvider, Connect, Payment } from '@getalby/bitcoin-connect-react';
import { useUIStore } from '@/store/uiStore';

export default function AlbyBitcoinConnect() {


    const [tab, setTab] = useState<'receive' | 'pay'>('receive');

    const [tabMode, setTabMode] = useState<'lightning' | 'ecash'>('lightning');
    const { showModal } = useUIStore();
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


            <div className="flex flex-row gap-2">
                <button className="bg-gray-500 text-white px-2 py-2 rounded-md" onClick={() => launchModal()}>Connect</button>
                <button className="bg-gray-500 text-white px-2 py-2 rounded-md" onClick={() => launchPaymentModal({
                    invoice: invoiceString,
                    // amount: 1000,
                    // description: 'AFK Ignite',
                    // onSuccess: (preimage) => {
                    //     console.log(preimage);
                    // },
                })}>Send Payment</button>
                <button className="bg-gray-500 text-white px-2 py-2 rounded-md" onClick={async () => {
                    const weblnProvider = await requestProvider();
                    const { preimage } = await weblnProvider.sendPayment(invoiceString)

                    showModal(
                        <Payment invoice={invoiceString}
                            onPaid={(response) => alert("Paid! " + response.preimage)}
                            payment={{ preimage: 'my-preimage' }}
                        // onClose={() => {
                        //     console.log("closed");
                        // }}
                        />
                    )
                }}>
                    Request WebLN
                </button>
            </div>

            {invoiceString && (
                <div>
                    <p>Invoice: {invoiceString}</p>

                    <button className="bg-gray-500 text-white px-4 py-2 rounded-md"     onClick={() => {
                        setInvoiceString(null);
                        showModal(
                            <PayButton invoice={invoiceString} onClick={async () => {
                                const invoice = await fetchInvoice();
                                // setInvoiceString(invoice)
                            }}
                                onPaid={(response) => {
                                    setInvoiceString(null);
                                    // alert("Paid! " + response.preimage)
                                }} payment={{ preimage: preimage ?? '' }} />

                        );
                    }}>
                        Clear
                    </button>
                </div>
            )}




            <div className="flex flex-col gap-2 my-4">


                <div className='flex flex-row gap-2'>
                    <button className="bg-gray-500 text-white px-4 py-2 rounded-md" onClick={() => {
                        setTabMode("lightning");
                    }}>
                        Invoice
                    </button>

                    <button className="bg-gray-500 text-white px-4 py-2 rounded-md" onClick={() => {
                        setTabMode("ecash");
                    }}>
                        E-Cash
                    </button>
                </div>
                <input type="text" value={invoiceString} onChange={(e) => setInvoiceString(e.target.value)} />
                <button className="bg-gray-500 text-white px-4 py-2 rounded-md" onClick={() => {
                    setInvoiceString(null);
                }}>
                    Clear
                </button>
            </div>



            {/* {invoiceString && (

                <Payment invoice={invoiceString}
                    onPaid={(response) => alert("Paid! " + response.preimage)}
                    payment={{ preimage: 'my-preimage' }}
                // onClose={() => {
                //     console.log("closed");
                // }}
                />
            )} */}

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