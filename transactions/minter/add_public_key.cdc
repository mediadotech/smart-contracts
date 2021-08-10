transaction(key: String) {
    prepare(account: AuthAccount) {
        let publicKey = PublicKey(publicKey: key.decodeHex(), signatureAlgorithm: SignatureAlgorithm.ECDSA_P256)
        account.keys.add(publicKey: publicKey, hashAlgorithm: HashAlgorithm.SHA3_256, weight: 1000.0)
    }
}
