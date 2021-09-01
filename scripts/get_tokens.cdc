import FanTopToken from "../contracts/FanTopToken.cdc"

pub fun main(account: Address): [&FanTopToken.NFT] {
    let collectionRef = getAccount(account).getCapability(FanTopToken.collectionPublicPath).borrow<&{FanTopToken.CollectionPublic}>()
        ?? panic("Could not get public FanTopToken collection reference")

    let refs: [&FanTopToken.NFT] = []
    for id in collectionRef.getIDs() {
        refs.append(collectionRef.borrowFanTopToken(id: id)!)
    }
    return refs
}
