import AuthCode from "../../contracts/AuthCode.cdc"

transaction(code: String) {
  let from: AuthAccount
  prepare(from: AuthAccount) {
    self.from = from
  }

  execute {
    AuthCode.requestAuth(from: self.from, code: code)
  }
}
