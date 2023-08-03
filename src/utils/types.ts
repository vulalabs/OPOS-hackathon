import type { PublicKey } from '@solana/web3.js';
import type BigNumber from 'bignumber.js';

export type Recipient = PublicKey;
export type Amount = BigNumber;
export type SPLToken = PublicKey;
export type Reference = PublicKey;
export type References = Reference | Reference[];
export type Link = URL;