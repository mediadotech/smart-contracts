import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction() {
    prepare(account: AuthAccount) {}

    execute {
        let permissions = FanTopPermissionV2.getAllPermissions()
        permissions[0xf8d6e0586b0a20c7]!.insert(key: FanTopPermissionV2.Role.minter, true)
    }

    post {
        !FanTopPermissionV2.hasPermission(0xf8d6e0586b0a20c7, role: FanTopPermissionV2.Role.minter): "Unexpectedly successful"
    }
}
