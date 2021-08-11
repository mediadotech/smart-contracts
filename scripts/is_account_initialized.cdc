import DigitalContentAsset from "../contracts/DigitalContentAsset.cdc"

pub fun main(address: Address): Bool {
    return getAccount(address).getCapability<&{DigitalContentAsset.CollectionPublic}>(/public/DCACollection).check()
}
