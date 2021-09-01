import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermission from "../../contracts/FanTopPermission.cdc"

transaction(receiver: Address) {
    let adminRef: &FanTopPermission.Admin
    let receiverRef: &AnyResource{FanTopPermission.Receiver}

    prepare(account: AuthAccount) {
        self.adminRef = account.borrow<&FanTopPermission.Holder>(from: FanTopPermission.receiverStoragePath)?.borrowAdmin(by: account)
            ?? panic("No admin in storage")
        self.receiverRef = getAccount(receiver).getCapability(FanTopPermission.receiverPublicPath).borrow<&AnyResource{FanTopPermission.Receiver}>()
            ?? panic("No permission receiver in storage")
    }

    execute {
        self.adminRef.addOperator(receiver: self.receiverRef)
    }
}
