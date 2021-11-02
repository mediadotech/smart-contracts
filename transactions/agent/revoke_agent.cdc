import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction() {
    let agent: FanTopPermissionV2.Agent

    prepare(account: AuthAccount) {
        self.agent = FanTopPermissionV2.Agent(account)
    }

    execute {
        self.agent.revoke()
    }
}
