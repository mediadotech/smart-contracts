import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction(to: Address, orderId: String, version: UInt32) {
    let agent: FanTopPermissionV2.Agent
    let collectionRef: &AnyResource{FanTopToken.CollectionPublic}

    prepare(account: AuthAccount) {
        self.agent = FanTopPermissionV2.Agent(account)

        self.collectionRef = getAccount(to).getCapability(FanTopToken.collectionPublicPath).borrow<&AnyResource{FanTopToken.CollectionPublic}>()
            ?? panic("Could not get public FanTopToken collection reference")
    }

    execute {
        self.agent.fulfill(orderId: orderId, version: version, recipient: self.collectionRef)
    }
}
