import type { Amount, Recipient, References, SPLToken } from './types';

export interface TransactionRequestURLFields {
    link: URL;
}

export interface TransferRequestURLFields {
    recipient: Recipient;
    amount?: Amount;
    splToken?: SPLToken;
    reference?: References;
}

export function encodeURL(fields: TransactionRequestURLFields | TransferRequestURLFields): URL {
    return 'link' in fields ? encodeTransactionRequestURL(fields) : encodeTransferRequestURL(fields);
}

function encodeTransactionRequestURL({ link }: TransactionRequestURLFields): URL {
    // Remove trailing slashes
    const pathname = link.search
        ? encodeURIComponent(String(link).replace(/\/\?/, '?'))
        : String(link).replace(/\/$/, '');
    const url = new URL('solana:' + pathname);

    return url;
}

function encodeTransferRequestURL({
    recipient,
    amount,
    splToken,
    reference,
}: TransferRequestURLFields): URL {
    const pathname = recipient.toBase58();
    const url = new URL('solana:' + pathname);

    if (amount) {
        url.searchParams.append('amount', amount.toFixed(amount.decimalPlaces() ?? 0));
    }

    if (splToken) {
        url.searchParams.append('spl-token', splToken.toBase58());
    }

    if (reference) {
        if (!Array.isArray(reference)) {
            reference = [reference];
        }

        for (const pubkey of reference) {
            url.searchParams.append('reference', pubkey.toBase58());
        }
    }

    return url;
}