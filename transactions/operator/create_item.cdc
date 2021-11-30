import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(itemId: String, version: UInt32, limit: UInt32, metadata: { String: String }, active: Bool) {
    let operatorRef: &FanTopPermissionV2a.Operator

    prepare(account: AuthAccount) {
        self.operatorRef = account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath)?.borrowOperator(by: account)
            ?? panic("No operator in storage")
    }

    execute {
        self.operatorRef.createItem(itemId: itemId, version: version, limit: limit, metadata: metadata, active: active)
    }
}
