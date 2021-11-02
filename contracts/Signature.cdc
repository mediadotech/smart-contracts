import Crypto

pub contract Signature {
    access(account) fun verify(signature: [UInt8], signedData: [UInt8], account: PublicAccount, keyIndex: Int): Bool {
        let key = account.keys.get(keyIndex: 0) ?? panic("Keys that cannot be referenced cannot be used")
        assert(!key.isRevoked, message: "Revoked keys cannot be used")

        let keyList = Crypto.KeyList()
        keyList.add(
            key.publicKey,
            hashAlgorithm: key.hashAlgorithm,
            weight: key.weight
        )

        let signatureSet: [Crypto.KeyListSignature] = [
            Crypto.KeyListSignature(
                keyIndex: keyIndex,
                signature: signature
            )
        ]

        return keyList.verify(
            signatureSet: signatureSet,
            signedData: signedData,
        )
    }
}
