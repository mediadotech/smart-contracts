import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"

transaction {
    prepare(acct: AuthAccount) {
        if acct.borrow<&DigitalContentAsset.Collection>(from: DigitalContentAsset.collectionStoragePath) != nil {
            panic("The account has already been initialized.")
        }

        let collection <- DigitalContentAsset.createEmptyCollection() as! @DigitalContentAsset.Collection
        acct.save(<-collection, to: DigitalContentAsset.collectionStoragePath)
        acct.link<&{DigitalContentAsset.CollectionPublic}>(DigitalContentAsset.collectionPublicPath, target: DigitalContentAsset.collectionStoragePath)
    }
}
