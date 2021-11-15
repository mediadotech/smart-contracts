import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction() {
    prepare(account: AuthAccount) {}

    execute {
        let permissions = FanTopPermissionV2a.getAllPermissions()
        permissions[0xf8d6e0586b0a20c7]!.insert(key: "minter", true)
    }

    post {
        !FanTopPermissionV2a.hasPermission(0xf8d6e0586b0a20c7, role: "minter"): "Unexpectedly successful"
    }
}
