import { createEmulator, FlowEmulator } from "../utils/emulator"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

// 誰でもユーザーとしてアカウントを初期化できる
test('Anyone can initialize an account as a user', async () => {
    expect(
        emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    ).toBeTruthy()
})

// 一度初期化したユーザーは重複してアカウントを初期化できない
test('Once initialized, users cannot initialize their accounts more than once', async () => {
    emulator.signer('emulator-user-2').transactions('transactions/user/init_account.cdc')
    expect(() =>
        emulator.signer('emulator-user-2').transactions('transactions/user/init_account.cdc')
    ).toThrowError('error: panic: The account has already been initialized.')
})
