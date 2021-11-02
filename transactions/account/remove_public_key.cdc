transaction(keyIndex: Int) {
    prepare(account: AuthAccount) {
        account.keys.revoke(keyIndex: keyIndex)
    }
}
