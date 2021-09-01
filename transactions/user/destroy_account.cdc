import FanTopToken from "../../contracts/FanTopToken.cdc"

transaction {
    prepare(acct: AuthAccount) {
        let collection <- acct.load<@FanTopToken.Collection>(from: FanTopToken.collectionStoragePath)
            ?? panic("That account has not been initialized.")
        destroy collection
    }
}
