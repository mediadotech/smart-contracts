import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, bool, event, events, string } from "../__fixtures__/args"

describe('Operator', () => {
    let emulator: FlowEmulator
    beforeAll(async () => {
        emulator = await createEmulator()
        emulator.transactions('transactions/permission/v2a/init_permission_receiver.cdc')
        emulator.transactions('transactions/owner/add_admin.cdc', address(accounts['emulator-account'].address))
        emulator.signer('emulator-user-2').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    })

    afterAll(() => {
        emulator?.terminate()
    })

    beforeEach(() => {
        emulator.signer('emulator-user-1').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
        emulator.transactions('transactions/admin/add_operator.cdc', address(accounts['emulator-user-1'].address))
    })

    afterEach(() => {
        emulator?.signer('emulator-user-1').transactions('transactions/permission/v2a/destroy_permission_receiver.cdc')
    })

    // Operatorは自身を失効させることができる
    test('Operator can revoke itself', () => {
        expect(
            emulator.signer('emulator-user-1').transactions('transactions/permission/v2a/revoke_self.cdc', string('operator'))
        ).toEqual({
            authorizers: '[01cf0e2f2f715450]',
            events: events(
                event('A.f8d6e0586b0a20c7.FanTopPermissionV2a.PermissionRemoved', {
                    target: address(accounts["emulator-user-1"].address),
                    role: string("operator")
                })
            ),
            id: expect.any(String),
            payer: '01cf0e2f2f715450',
            payload: expect.any(String),
            status: 'SEALED'
        })

        expect(
            emulator.scripts('scripts/has_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        ).toEqual(bool(false))
    })

    // Operatorではない者は自身を失効できない
    test('Non-Operators cannot revoke themselves', () => {
        expect(() =>
            emulator.signer('emulator-user-2').transactions('transactions/permission/v2a/revoke_self.cdc', string('operator'))
        ).toThrowError('error: pre-condition failed: Permissions that do not exist cannot be deleted')
    })
})

describe('Minter', () => {
    let emulator: FlowEmulator
    beforeAll(async () => {
        emulator = await createEmulator()
        emulator.transactions('transactions/permission/v2a/init_permission_receiver.cdc')
        emulator.transactions('transactions/owner/add_admin.cdc', address(accounts['emulator-account'].address))
        emulator.signer('emulator-user-2').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    })

    afterAll(() => {
        emulator?.terminate()
    })

    beforeEach(() => {
        emulator.signer('emulator-user-1').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
        emulator.transactions('transactions/admin/add_minter.cdc', address(accounts['emulator-user-1'].address))
    })

    afterEach(() => {
        emulator?.signer('emulator-user-1').transactions('transactions/permission/v2a/destroy_permission_receiver.cdc')
    })

    // Minterは自身を失効させることができる
    test('Minter can revoke itself', () => {
        expect(
            emulator.signer('emulator-user-1').transactions('transactions/permission/v2a/revoke_self.cdc', string('minter'))
        ).toEqual({
            authorizers: '[01cf0e2f2f715450]',
            events: events(
                event('A.f8d6e0586b0a20c7.FanTopPermissionV2a.PermissionRemoved', {
                    target: address(accounts["emulator-user-1"].address),
                    role: string("minter")
                })
            ),
            id: expect.any(String),
            payer: '01cf0e2f2f715450',
            payload: expect.any(String),
            status: 'SEALED'
        })

        expect(
            emulator.scripts('scripts/has_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
        ).toEqual(bool(false))
    })

    // Minterではない者は自身を失効できない
    test('Non-Minters cannot revoke themselves', () => {
        expect(() =>
            emulator.signer('emulator-user-2').transactions('transactions/permission/v2a/revoke_self.cdc', string('minter'))
        ).toThrowError('error: pre-condition failed: Permissions that do not exist cannot be deleted')
    })
})

describe('Agent', () => {
    let emulator: FlowEmulator
    beforeAll(async () => {
        emulator = await createEmulator()
        emulator.transactions('transactions/permission/v2a/init_permission_receiver.cdc')
        emulator.transactions('transactions/owner/add_admin.cdc', address(accounts['emulator-account'].address))
        emulator.signer('emulator-user-2').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    })

    afterAll(() => {
        emulator?.terminate()
    })

    beforeEach(() => {
        emulator.signer('emulator-user-1').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
        emulator.transactions('transactions/admin/add_agent.cdc', address(accounts['emulator-user-1'].address))
    })

    afterEach(() => {
        emulator?.signer('emulator-user-1').transactions('transactions/permission/v2a/destroy_permission_receiver.cdc')
    })

    // Agentは自身を失効させることができる
    test('Agent can revoke itself', () => {
        expect(
            emulator.signer('emulator-user-1').transactions('transactions/permission/v2a/revoke_self.cdc', string('agent'))
        ).toEqual({
            authorizers: '[01cf0e2f2f715450]',
            events: events(
                event('A.f8d6e0586b0a20c7.FanTopPermissionV2a.PermissionRemoved', {
                    target: address(accounts["emulator-user-1"].address),
                    role: string("agent")
                })
            ),
            id: expect.any(String),
            payer: '01cf0e2f2f715450',
            payload: expect.any(String),
            status: 'SEALED'
        })

        expect(
            emulator.scripts('scripts/has_permission.cdc', address(accounts["emulator-user-1"].address), string("agent"))
        ).toEqual(bool(false))
    })

    // Agentではない者は自身を失効できない
    test('Non-Agents cannot revoke themselves', () => {
        expect(() =>
            emulator.signer('emulator-user-2').transactions('transactions/permission/v2a/revoke_self.cdc', string('agent'))
        ).toThrowError('error: pre-condition failed: Permissions that do not exist cannot be deleted')
    })
})
