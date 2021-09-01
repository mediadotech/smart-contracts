import FanTopToken from "../contracts/FanTopToken.cdc"

pub fun main(address: Address): Bool {
    return getAccount(address).getCapability<&{FanTopToken.CollectionPublic}>(/public/FanTopTokenCollection).check()
}
