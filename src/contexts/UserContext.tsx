import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export const UserContext = createContext({
    user: null,
    handleLogout: async () => {},
    updateUserWalletAddress: async (walletAddress) => {}, // Accept 'walletAddress' as a parameter
});


export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
 
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();

        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async ( publicKey ) => {
    try {
     
      const requestBody = {
        publicKey: publicKey,
        user_uid: user.id,
      };
  
      // Save the wallet data to the 'wallets' table in Supabase
      const { data, error } = await supabase.from('wallets').insert([requestBody]);
  
      if (error) {
        console.error('Error creating wallet.', error);
        return false; // Return false indicating failure
      } else {
        console.log('Wallet data saved successfully:', data);
        return true; // Return true indicating success
      }
    } catch (error) {
      console.error('Error creating wallet.', error);
      return false; // Return false indicating failure
    }
  };

  const updateUserWalletAddress = async (walletAddress) => { // Accept 'walletAddress' as a parameter
    try {
        if (user && !user.walletAddress) {
            // Save the wallet data to the 'wallets' table in Supabase
            const saved = await handleSubmit(walletAddress); // Pass 'walletAddress' as an argument
            if (saved) {
                // Update the 'user' state with the wallet address
                await supabase.auth.updateUser({
                    data: { walletAddress },
                });
                setUser((prevState) => ({ ...prevState, walletAddress }));
                console.log(user);
            } else {
                console.error('Error generating wallet.');
            }
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
};

  const handleLogout = async () => {
    try {
      let { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('Logged out successfully');
        setUser(null); // Reset the user state to null when the user logs out
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, handleLogout, updateUserWalletAddress }}>
      {children}
    </UserContext.Provider>
  );
};
