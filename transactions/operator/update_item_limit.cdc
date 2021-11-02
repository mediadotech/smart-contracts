import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction(itemId: String, limit: UInt32) {
    let operator: FanTopPermissionV2.Operator

    prepare(account: AuthAccount) {
        self.operator = FanTopPermissionV2.Operator(account)
    }

    execute {
        self.operator.updateLimit(itemId: itemId, limit: limit)
    }
}
