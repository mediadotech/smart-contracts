import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(itemId: String, version: UInt32, metadata: { String: String }) {
    let operatorRef: &FanTopPermissionV2a.Operator

    prepare(account: AuthAccount) {
        self.operatorRef = account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath)?.borrowOperator(by: account)
            ?? panic("No operator in storage")
    }

    execute {
        self.operatorRef.updateMetadata(itemId: itemId, version: version, metadata: metadata)
    }
}
