import DigitalContentAsset from "../contracts/DigitalContentAsset.cdc"

pub fun main(account: Address, id: UInt64): &DigitalContentAsset.NFT? {
    let collectionRef = getAccount(account).getCapability(DigitalContentAsset.collectionPublicPath).borrow<&{DigitalContentAsset.CollectionPublic}>()
        ?? panic("Could not get public DCA collection reference")
    return collectionRef.borrowDCAToken(id: id)
}
