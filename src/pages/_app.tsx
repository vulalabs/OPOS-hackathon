import { AppProps } from 'next/app';
import React, { FC } from 'react';
import { UserProvider } from '../contexts/UserContext'

require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {

  return (
    <>
      <UserProvider>
            <div className={`flex flex-col h-screen`}>
              <Component {...pageProps}
              />
            </div>
      </UserProvider>
    </>
  );
};

export default App;