import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(itemId: String, limit: Int) {
    let operatorRef: &FanTopPermissionV2a.Operator

    prepare(account: AuthAccount) {
        self.operatorRef = account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath)?.borrowOperator(by: account)
            ?? panic("No operator in storage")
    }

    execute {
        self.operatorRef.truncateSerialBox(itemId: itemId, limit: limit)
    }
}
