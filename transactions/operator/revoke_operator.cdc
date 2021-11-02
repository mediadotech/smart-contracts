import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction() {
    let operator: FanTopPermissionV2.Operator

    prepare(account: AuthAccount) {
        self.operator = FanTopPermissionV2.Operator(account)
    }

    execute {
        self.operator.revoke()
    }
}
