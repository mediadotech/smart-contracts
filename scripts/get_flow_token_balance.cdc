import FungibleToken from "../contracts/FungibleToken.cdc"
import FlowToken from "../contracts/FlowToken.cdc"

pub fun main(account: Address): UFix64 {

    let vaultRef = getAccount(account)
        .getCapability(/public/flowTokenBalance)
        .borrow<&AnyResource{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
