import FanTopToken from "../contracts/FanTopToken.cdc"

pub fun main(account: Address, id: UInt64): &FanTopToken.NFT? {
    let collectionRef = getAccount(account).getCapability(FanTopToken.collectionPublicPath).borrow<&{FanTopToken.CollectionPublic}>()
        ?? panic("Could not get public FanTopToken collection reference")
    return collectionRef.borrowFanTopToken(id: id)
}
