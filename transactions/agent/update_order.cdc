import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction(orderId: String, version: UInt32, metadata: { String: String }) {
    let agent: FanTopPermissionV2.Agent

    prepare(account: AuthAccount) {
        self.agent = FanTopPermissionV2.Agent(account)
    }

    execute {
        self.agent.update(orderId: orderId, version: version, metadata: metadata)
    }
}
