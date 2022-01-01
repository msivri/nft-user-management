import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import detectEthereumProvider from "@metamask/detect-provider";


@Injectable({
    providedIn: 'root',
})
export class AuthService {

    constructor(private http: HttpClient) {

    }
    ethereum: any;
    login() {


        return from(detectEthereumProvider()).pipe(
            switchMap(async (provider) => {
                if (!provider) {
                    throw new Error('Please install MetaMask');
                }
                this.ethereum = provider;
                return await this.ethereum.request({ method: 'eth_requestAccounts' });
            }),
            switchMap(() =>
                this.http.post<NonceResponse>(
                    'http://localhost:3000/getNonceToSign',
                    {
                        address: this.ethereum.selectedAddress,
                    }
                )
            ),
            switchMap(
                async (response) =>
                    await this.ethereum.request({
                        method: 'personal_sign',
                        params: [
                            `0x${this.toHex(response.nonce)}`,
                            this.ethereum.selectedAddress,
                        ],
                    })
            ),
            switchMap(async (sig) => {
                let token = await this.http.post<VerifyResponse>(
                    'http://localhost:3000/verifySignedMessage',
                    { address: this.ethereum.selectedAddress, signature: sig }
                );
                return token;
            }));

    }
    logout() {

    }

    private toHex(stringToConvert: string) {
        return stringToConvert
            .split('')
            .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('');
    }

}
interface NonceResponse {
    nonce: string;
}
interface VerifyResponse {
    token: string;
}

