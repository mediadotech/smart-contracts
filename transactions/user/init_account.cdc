import FanTopToken from "../../contracts/FanTopToken.cdc"

transaction {
    prepare(acct: AuthAccount) {
        if acct.borrow<&FanTopToken.Collection>(from: FanTopToken.collectionStoragePath) != nil {
            panic("The account has already been initialized.")
        }

        let collection <- FanTopToken.createEmptyCollection() as! @FanTopToken.Collection
        acct.save(<-collection, to: FanTopToken.collectionStoragePath)
        acct.link<&{FanTopToken.CollectionPublic}>(FanTopToken.collectionPublicPath, target: FanTopToken.collectionStoragePath)
    }
}
