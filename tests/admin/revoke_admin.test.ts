import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, bool, event, events, string } from "../__fixtures__/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-user-1"].address))
})

afterAll(() => {
    emulator?.terminate()
})

// Adminは自身を失効させることができる
test('Admin can revoke itself', () => {
    expect(
        emulator.signer('emulator-user-1').transactions('transactions/admin/revoke_admin.cdc')
    ).toEqual({
        authorizers: '[01cf0e2f2f715450]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopPermissionV2.PermissionRemoved', {
                target: address(accounts["emulator-user-1"].address),
                role: string("admin")
            })
        ),
        id: expect.any(String),
        payer: '01cf0e2f2f715450',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(
        emulator.scripts('scripts/has_permission.cdc', address(accounts["emulator-user-1"].address), string("admin"))
    ).toEqual(bool(false))
})

// Adminではない者は自身を失効できない
test('Non-Admins cannot revoke themselves', () => {
    expect(() =>
        emulator.signer("emulator-user-1").transactions('transactions/admin/revoke_admin.cdc')
    ).toThrowError('FanTopPermissionV2.hasPermission(account.address, role: Role.admin)')
})
