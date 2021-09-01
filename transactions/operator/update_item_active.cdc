import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermission from "../../contracts/FanTopPermission.cdc"

transaction(itemId: String, active: Bool) {
    let operatorRef: &FanTopPermission.Operator

    prepare(account: AuthAccount) {
        self.operatorRef = account.borrow<&FanTopPermission.Holder>(from: FanTopPermission.receiverStoragePath)?.borrowOperator(by: account)
            ?? panic("No operator in storage")
    }

    execute {
        self.operatorRef.updateActive(itemId: itemId, active: active)
    }
}
