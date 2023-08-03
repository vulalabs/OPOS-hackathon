import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Checkout from '../../components/Checkout';
import axios from 'axios';

const cache = {
  data: null,
  lastFetch: 0,
  interval: 300000, // 5 minutes in milliseconds
};

const CheckoutPage = () => {
  const router = useRouter();
  const slug = router.query.slug; // Access the slug from router.query
  const [tokens, setTokens] = useState(cache.data); // Initialize tokens state with cached data
 
  useEffect(() => {
    async function fetchTokenData() {
      try {
        const now = Date.now();
        if (cache.data && cache.lastFetch + cache.interval > now) {
          // Return cached data if it exists and is not older than the interval
          setTokens(cache.data);
          return;
        }

        const response = await axios.get('https://token.jup.ag/all');
        const tokenData = response.data;
        cache.data = tokenData;
        cache.lastFetch = now;
        setTokens(tokenData);
      } catch (error) {
        console.error(error);
        setTokens(null);
      }
    }

    fetchTokenData();
  }, []);

  return (
    <>
      {tokens && <Checkout link={slug} tokens={tokens}  />}
    </>
  );
};

export default CheckoutPage;
