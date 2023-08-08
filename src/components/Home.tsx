import React, { useContext, useState, useEffect } from "react";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { UserContext } from '../contexts/UserContext'; // Import the UserContext
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../supabase';
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { ArrowLeftOnRectangleIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";

export default function Home() {
    const { user, updateUserWalletAddress, handleLogout } = useContext(UserContext); // Access the user context using useContext
    const [formStatus, setFormStatus] = useState('Generate Checkout Link'); // State to manage the form submission status
    const [directory, setDirectory] = useState([]);
    const [showFullAddress, setShowFullAddress] = useState(false);
    const [walletAddress, setWalletAddress] = useState(user?.user_metadata.walletAddress || '');

    const toggleFullAddress = () => {
        setShowFullAddress(!showFullAddress);
    };

    function isValidSolanaAddress(address) {
        try {
            new PublicKey(address);
            return true;
        } catch (error) {
            return false;
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (walletAddress && user) {
            // Save the wallet address to the user context and Supabase
            const validate = isValidSolanaAddress(walletAddress)
            if (validate) {
                await updateUserWalletAddress(walletAddress);
            } else {
                setFormStatus('Invalid Wallet Address');
            }
        }
        // Get the form data from the input fields
        const name = event.target.elements.name.value;
        const price = parseFloat(event.target.elements['price'].value.replace(/\$/g, ''));
        const wallet = user.user_metadata.walletAddress;
        const link = uuidv4().substr(0, 10);
        const user_uid = user.id;

        try {
            const formData = {
                name,
                price,
                wallet,
                link,
                user_uid,
            };

            const { data, error } = await supabase
                .from('merchants')
                .insert([formData]);

            if (error) {
                console.error('Error saving data:', error);
                setFormStatus('Error Creating Checkout Link');
            } else {
                setFormStatus('Success');
                setDirectory([...directory, formData]); // Update the directory with the new form data
                createList();
                setTimeout(() => {
                    setFormStatus('Generate Checkout Link'); // Reset the status back to after a delay
                }, 1000);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            setFormStatus('Error Creating Checkout Link');
        }
    };

    useEffect(() => {
        if (user) {
            createList();
        }
    }, [user]);

    const createList = async () => {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .select('*')
                .eq('user_uid', user.id)
                .order('created_at', { ascending: false }); // Sort by 'created_at' in descending order (newest to oldest)

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setDirectory(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div className="max-h-screen">
            {user && (
                <div className="absolute top-4 left-4">
                    <button
                        className="bg-[#344154] p-2.5 rounded-full text-white hover:text-gray-300 ease-in duration-100"
                        onClick={handleLogout}
                    >
                        <ArrowLeftOnRectangleIcon className="w-5" />
                    </button>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 px-4 md:px-8 lg:px-24">
                <div className="grid row-span-1 md:col-span-1 m-6 p-6 mt-12 lg:mt-32">
                    {!user ? (
                        <div>
                            <div>
                                <h1 className="text-2xl text-center lg:text-left text-white font-bold">Welcome back 👋</h1>
                                <p className="text-white my-2 text-center lg:text-left ">Enter your credentials to access your checkout links</p>
                            </div>
                            <Auth
                                supabaseClient={supabase}
                                theme="dark"
                                appearance={{
                                    theme: ThemeSupa,
                                    variables: {
                                        default: {
                                            colors: {
                                                brand: '#303C4D',
                                                brandAccent: '#303C4D',
                                            },
                                        },
                                    },
                                }}
                                providers={['github']}
                            />
                        </div>
                    ) : (
                        <div>
                            <h2 className="font-bold text-xl text-white pl-7 pb-2">
                                Your Checkout Links
                            </h2>
                            <nav className="custom-scrollbar overflow-y-auto max-h-96 border border-gray-100/10 rounded-2xl" aria-label="Directory" >
                                <ul role="list" className="divide-y divide-gray-100/10 px-4">
                                    {directory.map((merchant) => (
                                        <li key={merchant.link} className="flex gap-x-4 px-3 py-5">
                                            <div className="flex-grow">
                                                <p className="text-sm font-semibold leading-6 text-white">{merchant.name}</p>
                                                <p className="mt-1 truncate text-sm leading-5 text-gray-500">${merchant.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center">
                                                <Link href={`/checkout/${merchant.link}`} className="text-sm font-semibold leading-6 text-white">
                                                    Visit Link
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
                {/* Right Section */}
                <div className="grid row-span-1 md:col-span-1 mt-0 md:mt-12">
                    <form onSubmit={handleSubmit} className="relative rounded-2xl bg-[#344154] m-4 md:m-6 p-4 md:p-6 shadow-lg h-full">
                        <div className="mb-2 md:mb-4">
                            <label htmlFor="wallet" className="mb-2 block text-lg font-bold text-white">
                                Wallet
                            </label>
                            <div className="flex flex-row text-xl shadow-lg rounded-lg bg-[#344154] block w-full text-white placeholder:text-gray-400 px-3 py-4 ring-1 ring-inset ring-gray-300 focus-within:z-10 outline-0 border-0 ">
                                <input
                                    type="text"
                                    name="wallet"
                                    id="wallet"
                                    className={`text-xl bg-[#344154] block w-full border-0 p-0 text-white ${walletAddress === user?.user_metadata.walletAddress ? 'text-gray-400' : ''
                                        } placeholder:text-gray-400 focus:ring-0`}
                                    placeholder={
                                        user && walletAddress !== user.user_metadata.walletAddress
                                            ? `${user.user_metadata.walletAddress.slice(0, 4)}...${showFullAddress ? user.user_metadata.walletAddress.slice(4, -4) : ''}${user.user_metadata.walletAddress.slice(-4)}`
                                            : `7AFi...NeX`
                                    }
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                />
                                {user && (
                                    <button
                                        type="button"
                                        className="text-gray-400"
                                        onClick={toggleFullAddress}
                                    >
                                        {showFullAddress ?
                                            <EyeIcon className="w-4" /> :
                                            <EyeSlashIcon className="w-4" />
                                        }
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="mb-2 md:mb-4">
                            <label htmlFor="name" className="mb-2 block text-lg font-bold text-white">
                                Name
                            </label>
                            <div className="flex flex-row text-xl shadow-lg rounded-lg bg-[#344154] block w-full text-white placeholder:text-gray-400 px-3 py-4 ring-1 ring-inset ring-gray-300 focus-within:z-10 outline-0 border-0 ">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="text-xl bg-[#344154] block w-full border-0 p-0 text-white placeholder:text-gray-400 focus:ring-0"
                                    placeholder="Water Bottle"
                                />
                            </div>
                        </div>
                        <div className="mb-2 md:mb-4">
                            <label htmlFor="price" className="mb-2 block text-lg font-bold text-white">
                                Price
                            </label>
                            <div className="flex flex-row text-xl shadow-lg rounded-lg bg-[#344154] block w-full text-white placeholder:text-gray-400 px-3 py-4 ring-1 ring-inset ring-gray-300 focus-within:z-10 outline-0 border-0 ">
                                <span
                                    className="mr-1 text-xl bg-[#344154] border-0 p-0 text-gray-400 focus:ring-0"
                                >
                                    $
                                </span>
                                <input
                                    type="text"
                                    name="price"
                                    id="price"
                                    className="text-xl bg-[#344154] block w-full border-0 p-0 text-white placeholder:text-gray-400 focus:ring-0"
                                    placeholder="5.00"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={`mt-4 bg-[#1F2935] ${user ? 'hover:bg-[#161d25]' : 'cursor-not-allowed'
                                } ease-in duration-100 px-4 py-3 rounded-lg text-lg text-white shadow-lg w-full`}
                            onSubmit={handleSubmit}
                            disabled={!user}
                        >
                            {formStatus}
                        </button>
                        <a className="pt-6 pb-2 text-xs md:text-lg md:pb-0 md:absolute md:left-0 md:bottom-6 flex flex-row w-full items-center justify-center gap-x-2">
                            <h3 className="font-bold text-white">Powered by</h3>
                            <img className="w-6" src="/jupiter-logo.svg" alt="Jupiter Logo" />
                            <h3 className="font-bold text-white">Pay</h3>
                        </a>
                    </form>
                </div>
            </div>
        </div>
    )
}