import DigitalContentAsset from "../contracts/DigitalContentAsset.cdc"

pub fun main(account: Address): [&DigitalContentAsset.NFT] {
    let collectionRef = getAccount(account).getCapability(DigitalContentAsset.collectionPublicPath).borrow<&{DigitalContentAsset.CollectionPublic}>()
        ?? panic("Could not get public DCA collection reference")

    let refs: [&DigitalContentAsset.NFT] = []
    for id in collectionRef.getIDs() {
        refs.append(collectionRef.borrowDCAToken(id: id)!)
    }
    return refs
}
