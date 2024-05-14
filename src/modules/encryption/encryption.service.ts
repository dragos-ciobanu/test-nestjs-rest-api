import { Injectable } from '@nestjs/common';

var CryptoJS = require("crypto-js");
@Injectable()
export class EncryptionService {
    private readonly secretKey = 'secret-key';

    encrypt(text: string): string {
        return CryptoJS.AES.encrypt(text, this.secretKey).toString();
    }

    decrypt(cipherText: string): string {
        const bytes = CryptoJS.AES.decrypt(cipherText, this.secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}
