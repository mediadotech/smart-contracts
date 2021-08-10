import { createEmulator, FlowEmulator } from "../utils/emulator"
import { accounts } from '../../flow.json'
import { address, bool, dicaa, enumUint8, event, events, optional, uint8 } from "../utils/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

beforeEach(() => {
    emulator.signer('emulator-user-1').transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.signer('emulator-user-2').transactions('transactions/permission/init_permission_receiver.cdc')
})

afterEach(() => {
    try { emulator.signer('emulator-user-1').transactions('transactions/permission/destroy_permission_receiver.cdc') } catch {}
    try { emulator.signer('emulator-user-2').transactions('transactions/permission/destroy_permission_receiver.cdc') } catch {}
})

// OwnerはAdminを追加できる
test('Owner can add Admin', () => {
    expect(
        emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.DCAPermission.PermissionAdded', {
                target: address(accounts["emulator-user-1"].address),
                role: uint8(1) // admin
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
        dicaa([{
            key: enumUint8('A.f8d6e0586b0a20c7.DCAPermission.Role', 1),
            value: bool(true)
        }])
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
    ).toThrowError('error: pre-condition failed: Existing roles are not added')
})
