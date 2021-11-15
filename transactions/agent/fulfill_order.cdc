import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(to: Address, orderId: String, version: UInt32) {
    let agentRef: &FanTopPermissionV2a.Agent
    let collectionRef: &AnyResource{FanTopToken.CollectionPublic}

    prepare(account: AuthAccount) {
        self.agentRef = account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath)?.borrowAgent(by: account)
            ?? panic("No agent in storage")
        self.collectionRef = getAccount(to).getCapability(FanTopToken.collectionPublicPath).borrow<&AnyResource{FanTopToken.CollectionPublic}>()
            ?? panic("Could not get public FanTopToken collection reference")
    }

    execute {
        self.agentRef.fulfill(orderId: orderId, version: version, recipient: self.collectionRef)
    }
}
