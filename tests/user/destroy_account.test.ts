import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

// ユーザーはアカウントを破棄することができる
test('User can destroy account', async () => {
    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    expect(
        emulator.signer('emulator-user-1').transactions('transactions/user/destroy_account.cdc')
    ).toBeTruthy()
})

// アカウントを初期化していないユーザーはアカウントを破棄することができない
test('Users who have not initialized their account cannot destroy their account', async () => {
    expect(() =>
        emulator.signer('emulator-user-2').transactions('transactions/user/destroy_account.cdc')
    ).toThrowError('error: panic: That account has not been initialized.')
})
