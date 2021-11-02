import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction(orderId: String) {
    let agent: FanTopPermissionV2.Agent

    prepare(account: AuthAccount) {
        self.agent = FanTopPermissionV2.Agent(account)
    }

    execute {
        self.agent.cancel(orderId: orderId)
    }
}
