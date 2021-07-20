import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"

transaction {
    prepare(acct: AuthAccount) {
        if acct.borrow<&DigitalContentAsset.Collection>(from: /storage/DCACollection) != nil {
            panic("The account has already been initialized.")
        }

        let collection <- DigitalContentAsset.createEmptyCollection() as! @DigitalContentAsset.Collection
        acct.save(<-collection, to: /storage/DCACollection)
        acct.link<&{DigitalContentAsset.CollectionPublic}>(/public/DCACollection, target: /storage/DCACollection)
    }
}
