import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, bool, dicsa, event, events, optional, string, uint8 } from "../__fixtures__/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

beforeEach(() => {
    emulator?.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("admin"))
})

afterEach(() => {
    try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("admin")) } catch { /* NOP */ }
})

// OwnerはAdminを削除できる
test('Owner can remove Admin', () => {
    expect(
        emulator.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("admin"))
    ).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopPermissionV2.PermissionRemoved', {
                target: address(accounts["emulator-user-1"].address),
                role: string("admin")
            })
        ),
        id: expect.any(String),
        payer: 'f8d6e0586b0a20c7',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(
        emulator.scripts('scripts/has_permission.cdc', address(accounts["emulator-user-1"].address), string("admin"))
    ).toEqual(bool(false))
})

// Ownerは重複してAdminを削除できない
test('Owner cannot delete Admin more than once', () => {
    emulator.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("admin"))
    expect(() =>
        emulator.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("admin"))
    ).toThrowError('error: pre-condition failed: Permissions that do not exist cannot be deleted')
})
