import Signature from "./Signature.cdc"

// Emulator only
pub contract Test {
    pub fun verifySignature(
        signature: [UInt8],
        signedData: [UInt8],
        account: PublicAccount,
        keyIndex: Int
    ): Bool {
        return Signature.verify(
            signature: signature,
            signedData: signedData,
            account: account,
            keyIndex: keyIndex
        )
    }
}
