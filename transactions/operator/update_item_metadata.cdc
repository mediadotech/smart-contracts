import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction(itemId: String, version: UInt32, metadata: { String: String }) {
    let operator: FanTopPermissionV2.Operator

    prepare(account: AuthAccount) {
        self.operator = FanTopPermissionV2.Operator(account)
    }

    execute {
        self.operator.updateMetadata(itemId: itemId, version: version, metadata: metadata)
    }
}
