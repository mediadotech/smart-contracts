import Test from "../contracts/Test.cdc"

pub fun main(signature: String, signedData: String): Bool {
    return Test.verifySignature(
        signature: signature.decodeHex(),
        signedData: signedData.decodeHex(),
        account: getAccount(0xf3fcd2c1a78f5eee),
        keyIndex: 0
    )
}
