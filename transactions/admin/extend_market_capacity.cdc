import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction(capacity: Int) {
    let admin: FanTopPermissionV2.Admin

    prepare(account: AuthAccount) {
        self.admin = FanTopPermissionV2.Admin(account)
    }

    execute {
        self.admin.extendMarketCapacity(capacity)
    }
}
