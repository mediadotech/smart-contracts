import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(orderId: String) {
    let agentRef: &FanTopPermissionV2a.Agent

    prepare(account: AuthAccount) {
        self.agentRef = account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath)?.borrowAgent(by: account)
            ?? panic("No agent in storage")
    }

    execute {
        self.agentRef.cancel(orderId: orderId)
    }
}
