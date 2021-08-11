import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"

transaction {
    prepare(acct: AuthAccount) {
        let collection <- acct.load<@DigitalContentAsset.Collection>(from: DigitalContentAsset.collectionStoragePath)
            ?? panic("That account has not been initialized.")
        destroy collection
    }
}
