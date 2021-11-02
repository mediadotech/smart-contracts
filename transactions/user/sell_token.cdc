import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopMarket from "../../contracts/FanTopMarket.cdc"
import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction(
    agent: Address,
    orderId: String,
    refId: String,
    nftId: UInt64,
    version: UInt32,
    metadata: { String: String },
    signature: String,
    keyIndex: Int
) {
    let capability: Capability<&FanTopToken.Collection>
    let user: FanTopPermissionV2.User
    prepare(account: AuthAccount) {
        self.user = FanTopPermissionV2.User(account)
        var capability = account.getCapability<&FanTopToken.Collection>(/private/FanTopTokenCollection)
        if !capability.check() {
            capability = account.link<&FanTopToken.Collection>(/private/FanTopTokenCollection, target:/storage/FanTopTokenCollection) ?? panic("Link failed")
        }
        self.capability = capability
    }

    execute {
        self.user.sell(
            agent: agent,
            capability: self.capability,
            orderId: orderId,
            refId: refId,
            nftId: nftId,
            version: version,
            metadata: metadata,
            signature: signature.decodeHex(),
            keyIndex: keyIndex
        )
    }
}
