import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction(itemId: String, active: Bool) {
    let operator: FanTopPermissionV2.Operator

    prepare(account: AuthAccount) {
        self.operator = FanTopPermissionV2.Operator(account)
    }

    execute {
        self.operator.updateActive(itemId: itemId, active: active)
    }
}
