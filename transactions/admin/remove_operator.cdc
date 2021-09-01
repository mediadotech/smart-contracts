import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermission from "../../contracts/FanTopPermission.cdc"

transaction(receiver: Address) {
    let adminRef: &FanTopPermission.Admin

    prepare(account: AuthAccount) {
        self.adminRef = account.borrow<&FanTopPermission.Holder>(from: FanTopPermission.receiverStoragePath)?.borrowAdmin(by: account)
            ?? panic("No admin in storage")
    }

    execute {
        self.adminRef.removeOperator(receiver)
    }
}
