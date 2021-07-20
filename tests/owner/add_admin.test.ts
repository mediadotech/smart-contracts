import { createEmulator, FlowEmulator } from "../utils/emulator"
import flowConfig from '../../flow.json'
import { address, event, events, uint32, uint8 } from "../utils/args"

const ADMIN_ADDRESS = '0x' + flowConfig.accounts["emulator-user-1"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/permission/init_permission_receiver.cdc --signer emulator-user-1')
})

afterAll(() => {
    emulator?.terminate()
})

// OwnerはAdminを作ることができる
test('Owner can create Admin', () => {
    expect(
        emulator.transactions('transactions/owner/add_admin.cdc', address(ADMIN_ADDRESS))
    ).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.DCAPermission.PermissionAdded', {
                target: address(ADMIN_ADDRESS),
                role: uint8(1) // admin
            })
        ),
        id: expect.any(String),
        payer: 'f8d6e0586b0a20c7',
        payload: expect.any(String),
        status: 'SEALED'
    })
})
