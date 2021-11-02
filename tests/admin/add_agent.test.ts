import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, bool, dicaa, dicsa, enumUint8, event, events, optional, string, uint8 } from "../__fixtures__/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-account"].address))
})

afterAll(() => {
    emulator?.terminate()
})

// AdminはAgentを追加できる
test('Admin can add Agent', () => {
    expect(
        emulator.transactions('transactions/admin/add_agent.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopPermissionV2.PermissionAdded', {
                target: address(accounts["emulator-user-1"].address),
                role: string("agent")
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
            agent: bool(true)
        })
    ))
})

// AdminではないユーザーはMinterを追加できない
test('Non-Admin users cannot add Agent', () => {
    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/admin/add_agent.cdc', address(accounts["emulator-user-1"].address))
    ).toThrowError('FanTopPermissionV2.hasPermission(account.address, role: Role.admin)')
})

// Adminは既存のagentを追加できない
test('Admin cannot add an existing Agent', () => {
    emulator.transactions('transactions/admin/add_agent.cdc', address(accounts["emulator-user-2"].address))

    expect(() =>
        emulator.transactions('transactions/admin/add_agent.cdc', address(accounts["emulator-user-2"].address))
    ).toThrowError('error: pre-condition failed: Permission that already exists cannot be added')
})