import { Fragment, useState, useEffect } from 'react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { supabase } from '../../supabase';
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import QRCode from 'qrcode'
import { encodeURL } from '../utils/encodeURL';
import BigNumber from 'bignumber.js';
import Link from 'next/link';

interface Token {
    address: string;
    name: string;
    symbol: string;
}

const Checkout = ({ link, tokens }) => {
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState(null)
    const [selected, setSelected] = useState(tokens[0])
    const [query, setQuery] = useState('')
    const [name, setName] = useState(null)
    const [price, setPrice] = useState(null)

    const filteredTokens =
        query === ''
            ? tokens
            : tokens.filter((token) =>
                token.name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            )

    useEffect(() => {
        setLoading(true);
        async function fetchData() {
            try {
                const { data, error } = await supabase
                    .from("merchants")
                    .select("*")
                    .eq("link", link)
                    .limit(1);

                if (error) {
                    console.error('Error fetching data:', error);
                    setLoading(false);
                    return;
                }
                setName(data[0].name)
                setPrice(data[0].price)
                const recipient = new PublicKey(data[0].wallet);
                const amount = BigNumber(data[0].price)
                const reference = new Keypair().publicKey;
                const splToken = new PublicKey(selected.address)            
                const url = encodeURL({ recipient, amount, splToken, reference });
                await generateQRCode(url.href)
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        }

        fetchData();
    }, [link, selected]);

    const generateQRCode = async (url) => {
        try {
            const qrCodeBuffer = await QRCode.toString(url, {
                errorCorrectionLevel: 'H',
                type: 'svg'
            });            
            if (qrCodeBuffer) {
                const svgBlob = new Blob([qrCodeBuffer], { type: 'image/svg+xml' });
                const objectURL = URL.createObjectURL(svgBlob);
                setQrCode(objectURL);                
            } else {
                console.error('Error generating QR code.');
                return null;
            }

        } catch (error) {
            console.error('Error generating QR code:', error);
            return null;
        }
    };

    return (
        <div className="max-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 px-6 md:px-24 lg:px-0 py-10 lg:py-30 lg:mt-24">
                {/* Token Selection */}
                <div className="col-span-1 lg:col-span-1">
                    <div className="mx-auto lg:mx-24">
                        <h2 className="text-xl lg:text-2xl text-gray-500 mb-1">{name}</h2>
                        <p className="flex flex-row text-lg lg:text-4xl text-white">
                            <span className="font-regular mr-0.5 lg:mr-1">$</span>
                            <span className="font-bold text-3xl lg:text-5xl">{price}</span>
                        </p>

                        <h1 className="text-2xl lg:text-3xl text-white font-bold my-4">
                            Select a token to pay with
                        </h1>

                        <Combobox
                            value={selected}
                            onChange={(token) => {
                                setSelected(token);
                            }}
                        >
                            <div className="relative">
                                <div className="relative w-full cursor-pointer overflow-hidden rounded-lg  text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                                    <Combobox.Input
                                        className="relative py-5  w-full cursor-pointer rounded-lg bg-[#303C4D] text-left shadow-md border-none  text-lg lg:text-md leading-5 text-white focus:ring-0"
                                        displayValue={(token: Token) => token.name}
                                        onChange={(event) => setQuery(event.target.value)}
                                    />
                                    <Combobox.Button className="absolute bg-[#303C4D] inset-y-0 right-0 flex items-center pl-48 pr-2 hover:opacity-50 duration-100 ease-in">
                                        <ChevronUpDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </Combobox.Button>
                                </div>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                    afterLeave={() => setQuery('')}
                                >
                                    <Combobox.Options className="absolute overflow-y-scroll mt-1 text-lg max-h-96 w-full overflow-auto rounded-md bg-[#303C4D] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        {filteredTokens.length === 0 && query !== '' ? (
                                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                                Nothing found.
                                            </div>
                                        ) : (
                                            filteredTokens.map((token) => (
                                                <Combobox.Option
                                                    key={token.address}
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'text-green-200' : 'text-white'
                                                        }`
                                                    }
                                                    value={token}
                                                >
                                                    {({ selected, active }) => (
                                                        <>

                                                            <span
                                                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                                    }`}
                                                            >
                                                                {token.name}
                                                            </span>
                                                            {selected ? (
                                                                <span
                                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'
                                                                        }`}
                                                                >
                                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Combobox.Option>
                                            ))
                                        )}
                                    </Combobox.Options>
                                </Transition>
                            </div>
                        </Combobox>
                    </div>
                </div>

                {/* QR Code */}
                <div className="col-span-1 lg:col-span-1 mt-6 lg:mt-12">                   
                    {qrCode ? (
                        <div className="mt-4 flex flex-col items-center">
                            <div className="">
                                <h1 className="text-2xl text-white font-bold mb-2">Scan with Phantom mobile</h1>
                            </div>
                            <div className="w-full lg:w-96">
                                <img
                                    className="w-full lg:object-cover rounded-3xl overflow-hidden"
                                    src={qrCode}
                                    alt="QR Code"
                                />
                            </div>
                        </div>
                    ) : (
                        <span className="flex flex-col items-center mt-4 text-gray-400">...</span>
                    )}
                </div>
            </div>
            <Link
                href="/"                
                className="pb-6 lg:pb-0 lg:absolute lg:bottom-6 flex flex-row w-full items-center justify-center gap-x-2 hover:opacity-80 ease-in duration-100"
            >
                <h3 className="font-bold text-white">Powered by</h3>
                <img className="w-7" src="/jupiter-logo.svg" alt="Jupiter Logo" />
                <h3 className="font-bold text-white">Pay</h3>
            </Link>
        </div>
    );
};

export default Checkout;
