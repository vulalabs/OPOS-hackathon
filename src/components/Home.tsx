import React, { useContext, useState, useEffect } from "react";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { UserContext } from '../contexts/UserContext'; // Import the UserContext
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../supabase';
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";

export default function Home() {
    const { user, updateUserWalletAddress, handleLogout } = useContext(UserContext); // Access the user context using useContext
    const [formStatus, setFormStatus] = useState('Submit'); // State to manage the form submission status
    const [walletStatus, setWalletStatus] = useState('Submit'); // State to manage the form submission status
    const [directory, setDirectory] = useState([]);
    const [walletAddress, setWalletAddress] = useState('');
    //console.log(user)
    function isValidSolanaAddress(address) {
        try {
            new PublicKey(address);
            return true;
        } catch (error) {
            return false;
        }
    }

    const handleClick = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        if (walletAddress && user) {
            // Save the wallet address to the user context and Supabase
            const validate = isValidSolanaAddress(walletAddress)
            if (validate) {
                await updateUserWalletAddress(walletAddress);
                setWalletStatus('Saved'); // Update the wallet status to 'Saved'
            } else {
                setWalletStatus('Invalid Address');
            }
        }
    };
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Get the form data from the input fields
        const name = event.target.elements.name.value;
        const price = parseInt(event.target.elements['price'].value.replace(/\$/g, ''));
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

            // Insert the form data into the merchants table
            const { data, error } = await supabase
                .from('merchants')
                .insert([formData]);

            if (error) {
                console.error('Error saving data:', error);
                setFormStatus('Error');
            } else {
                //console.log('Data saved successfully:', data);
                setFormStatus('Success');
                setDirectory([...directory, formData]); // Update the directory with the new form data
                createList(); 
                setTimeout(() => {
                    setFormStatus('Submit'); // Reset the status back to 'Submit' after a delay
                }, 1000);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            setFormStatus('Error');
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
                <div className="absolute top-4 right-4">
                    <button
                        className="bg-[#344154] px-4 py-2 rounded-md text-white font-semibold text-sm ml-auto"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 px-6 md:px-24 lg:px-0 py-10 lg:py-30 lg:mt-16">
                {/* Left Section */}
                <div className="grid row-span-1 lg:col-span-1 mt-12 mx-auto lg:mx-16">
                    <h1 className="text-4xl lg:text-5xl text-white font-bold text-center">
                        Get Paid in SPL Tokens
                    </h1>
                    <img className="w-full lg:object-cover" src="/qr.png" alt="QR Code" />
                </div>
                {/* Right Section */}
                <div className="mt-12 mx-8 lg:mx-16 grid row-span-1 lg:col-span-1">
                    {!user && (
                        <div>
                            <div>
                                <h1 className="text-3xl text-center lg:text-left text-white font-bold">Get started now</h1>
                                <p className="text-white my-2 text-center lg:text-left ">Enter your credentials to access your account</p>
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
                    )}
                    {user && !user.user_metadata.walletAddress && (
                        <div className="flex flex-col item-center text-center">
                            <div>
                                <h2 className="text-left text-2xl text-white mb-6">Wallet to receive payments.</h2>
                            </div>
                            <form onSubmit={handleClick}>
                                <div className=" bg-[#344154] relative rounded-md px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 outline-0 border-0 focus:ring-0 focus:ring-offset-0 focus:outline-0 ">
                                    <input
                                        type="text"
                                        name="wallet"
                                        id="wallet"
                                        className="text-xl bg-[#344154] block w-full border-0 p-0 text-white placeholder:text-gray-400 focus:ring-0 "
                                        placeholder="7AFi...NeX"
                                        value={walletAddress}
                                        onChange={(e) => setWalletAddress(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="mt-3 items-center bg-[#344154] hover:bg-[#303C4D] ease-in duration-100 px-4 py-3 mb-4 text-md lg:text-sm text-white shadow-sm rounded-md w-full"
                                    onClick={handleClick}
                                >
                                    {walletStatus}
                                </button>
                            </form>

                        </div>
                    )}
                  
                    {user && user.user_metadata.walletAddress && (
                        <div>
                            <h2 className="text-bold text-xl text-white mb-1">Sell Something</h2>
                            <div className="isolate -space-y-px rounded-md shadow-sm">
                                <form onSubmit={handleSubmit}>
                                    <div className=" bg-[#344154] relative rounded-md rounded-b-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 outline-0 border-0 focus:ring-0 focus:ring-offset-0 focus:outline-0 ">
                                        <label htmlFor="name" className="block text-xs font-medium text-white">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            className="text-xl bg-[#344154] block w-full border-0 p-0 text-white placeholder:text-gray-400 outline-0 border-0 focus:ring-0 focus:ring-offset-0 focus:outline-0 "
                                            placeholder="Icecream"
                                        />
                                    </div>
                                    <div className=" bg-[#344154] relative rounded-md rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 outline-0 border-0 focus:ring-0 focus:ring-offset-0 focus:outline-0 ">
                                        <label htmlFor="price" className="block text-xs font-medium text-white">
                                            Price
                                        </label>
                                        <div className="flex rounded-md shadow-sm ">
                                            <span
                                                className="mr-1 text-xl bg-[#344154] border-0 p-0 text-gray-400 outline-0 border-0 focus:ring-0 focus:ring-offset-0 focus:outline-0 "
                                            >
                                                $
                                            </span>
                                            <input
                                                type="text"
                                                name="price"
                                                id="price"
                                                className="text-xl bg-[#344154] block w-full border-0 p-0 text-white placeholder:text-gray-400 outline-0 border-0 focus:ring-0 focus:ring-offset-0 focus:outline-0"
                                                placeholder="5"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="mt-3 items-center bg-[#344154] hover:bg-[#303C4D] ease-in duration-100 px-4 py-3 mb-4 text-md lg:text-sm text-white shadow-sm rounded-md w-full"
                                        onSubmit={handleSubmit}
                                    >
                                        {formStatus}
                                    </button>
                                </form>
                            </div>

                            <div className="h-80 mt-2">
                                <nav className="ring-1 ring-inset ring-gray-300 rounded-2xl border-white h-full overflow-y-auto" aria-label="Directory">
                                    <h2 className="text-bold text-xl text-white pl-4 pt-2">
                                        Your Links
                                    </h2>
                                    <ul role="list" className="divide-y divide-gray-100/10 px-4">
                                        {directory.map((merchant) => (
                                            <li key={merchant.link} className="flex gap-x-4 px-3 py-5">
                                                <div className="flex-grow">
                                                    <p className="text-sm font-semibold leading-6 text-white">{merchant.name}</p>
                                                    <p className="mt-1 truncate text-sm leading-5 text-gray-500">${merchant.price}</p>
                                                </div>
                                                <div className="flex flex-col items-center justify-center">
                                                    <Link href={`/checkout/${merchant.link}`} className="text-sm font-semibold leading-6 text-white">
                                                        Visit Checkout
                                                    </Link>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>                
                        </div>
                    )} 
                </div>
            </div>
        </div>
    )
}