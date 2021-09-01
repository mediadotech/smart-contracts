import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermission from "../../contracts/FanTopPermission.cdc"

transaction(itemId: String, version: UInt32, metadata: { String: String }) {
    let operatorRef: &FanTopPermission.Operator

    prepare(account: AuthAccount) {
        self.operatorRef = account.borrow<&FanTopPermission.Holder>(from: FanTopPermission.receiverStoragePath)?.borrowOperator(by: account)
            ?? panic("No operator in storage")
    }

    execute {
        self.operatorRef.updateMetadata(itemId: itemId, version: version, metadata: metadata)
    }
}
