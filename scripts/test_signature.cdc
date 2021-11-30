import Test from "../contracts/Test.cdc"

pub fun main(signature: String, signedData: String, address: Address, keyIndex: Int): Bool {
    return Test.verifySignature(
        signature: signature.decodeHex(),
        signedData: signedData.decodeHex(),
        account: getAccount(address),
        keyIndex: keyIndex
    )
}
