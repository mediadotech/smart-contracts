import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, bool, dicsa, event, events, optional, string } from "../__fixtures__/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

beforeEach(() => {
    emulator?.signer('emulator-user-1').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator?.signer('emulator-user-2').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
})

afterEach(() => {
    try { emulator?.signer('emulator-user-1').transactions('transactions/permission/v2a/destroy_permission_receiver.cdc') } catch {}
    try { emulator?.signer('emulator-user-2').transactions('transactions/permission/v2a/destroy_permission_receiver.cdc') } catch {}
})

// OwnerはAdminを追加できる
test('Owner can add Admin', () => {
    expect(
        emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopPermissionV2a.PermissionAdded', {
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
        emulator.scripts('scripts/get_permission.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual(optional(
        dicsa({
            admin: bool(true)
        })
    ))
})

// OwnerではないユーザーはAdminを追加できない
test('Non-Owner users cannot add Admin', () => {
    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-user-2"].address))
    ).toThrowError('error: panic: No owner resource in storage')
})

// Ownerは既存のAdminを追加できない
test('Owner cannot add an existing Admin', () => {
    emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-user-2"].address))

    expect(() =>
        emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-user-2"].address))
    ).toThrowError('error: pre-condition failed: Permission that already exists cannot be added')
})
