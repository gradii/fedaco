/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export class Crypt {
  static getCryptor(): Encrypter {
    return new Encrypter();
  }
}

export class Encrypter {
  encrypt(value: any) {}
}
