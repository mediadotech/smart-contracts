import { createEmulator, FlowEmulator } from "../utils/emulator"
import { accounts } from '../../flow.json'
import { address, bool, dicaa, enumUint8, event, events, optional, uint8 } from "../utils/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('emulator-account').transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-account"].address))
})

afterAll(() => {
    emulator?.terminate()
})

beforeEach(() => {
    emulator.signer('emulator-user-1').transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.signer('emulator-user-2').transactions('transactions/permission/init_permission_receiver.cdc')
})

afterEach(() => {
    emulator.signer('emulator-user-1').transactions('transactions/permission/destroy_permission_receiver.cdc')
    emulator.signer('emulator-user-2').transactions('transactions/permission/destroy_permission_receiver.cdc')
})

// AdminはMinterを追加できる
test('Admin can add Minter', () => {
    expect(
        emulator.transactions('transactions/admin/add_minter.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopPermission.PermissionAdded', {
                target: address(accounts["emulator-user-1"].address),
                role: uint8(3) // minter
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
            key: enumUint8('A.f8d6e0586b0a20c7.FanTopPermission.Role', 3),
            value: bool(true)
        }])
    ))
})

// AdminではないユーザーはMinterを追加できない
test('Non-Admin users cannot add Minter', () => {
    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/admin/add_minter.cdc', address(accounts["emulator-user-1"].address))
    ).toThrowError('error: pre-condition failed: Roles not given cannot be borrowed')
})

// Adminは既存のMinterを追加できない
test('Admin cannot add an existing Minter', () => {
    emulator.transactions('transactions/admin/add_minter.cdc', address(accounts["emulator-user-2"].address))

    expect(() =>
        emulator.transactions('transactions/admin/add_minter.cdc', address(accounts["emulator-user-2"].address))
    ).toThrowError('error: pre-condition failed: Existing roles are not added')
})
