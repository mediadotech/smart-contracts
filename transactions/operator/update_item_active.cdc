import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(itemId: String, active: Bool) {
    let operatorRef: &FanTopPermissionV2a.Operator

    prepare(account: AuthAccount) {
        self.operatorRef = account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath)?.borrowOperator(by: account)
            ?? panic("No operator in storage")
    }

    execute {
        self.operatorRef.updateActive(itemId: itemId, active: active)
    }
}
