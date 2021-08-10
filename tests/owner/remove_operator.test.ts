import { createEmulator, FlowEmulator } from "../utils/emulator"
import { accounts } from '../../flow.json'
import { address, event, events, optional, uint8 } from "../utils/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('emulator-account').transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.signer('emulator-user-1').transactions('transactions/permission/init_permission_receiver.cdc')
})

afterAll(() => {
    emulator?.terminate()
})

// OwnerはOpeartorを削除できる
test('Owner can remove Opeartor', () => {
    emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-account"].address))
    emulator.transactions('transactions/admin/add_operator.cdc', address(accounts["emulator-user-1"].address))

    expect(
        emulator.transactions('transactions/owner/remove_operator.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.DCAPermission.PermissionRemoved', {
                target: address(accounts["emulator-user-1"].address),
                role: uint8(2) // opeartor
            })
        ),
        id: expect.any(String),
        payer: 'f8d6e0586b0a20c7',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(
        emulator.scripts('scripts/get_permission.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual(optional(null))
})

// OwnerではないユーザーはOperatorを削除できない
test('Non-Owner users cannot remove Operator', () => {
    expect(() =>
        emulator.signer("emulator-user-2").transactions('transactions/owner/remove_operator.cdc', address(accounts["emulator-user-1"].address))
    ).toThrowError('error: panic: No owner resource in storage')
})

// Ownerは重複してOperatorを削除できない
test('Owner cannot delete Operator more than once', () => {
    expect(() =>
        emulator.transactions('transactions/owner/remove_operator.cdc', address(accounts["emulator-user-1"].address))
    ).toThrowError('error: pre-condition failed: Roles that do not exist cannot be removed')
})
