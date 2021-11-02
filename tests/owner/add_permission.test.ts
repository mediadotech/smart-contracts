import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, bool, event, events, string } from "../__fixtures__/args"

describe('Operator', () => {
    let emulator: FlowEmulator

    beforeAll(async () => {
        emulator = await createEmulator()
    })

    afterAll(() => {
        emulator?.terminate()
    })

    beforeEach(async ()=> {
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("operator")) } catch { /* NOP */ }
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("minter")) } catch { /* NOP */ }
    })

    // OwnerはOperatorを追加できる
    test('Owner can add Operator', () => {
        expect(
            emulator.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        ).toEqual({
            authorizers: '[f8d6e0586b0a20c7]',
            events: events(
                event('A.f8d6e0586b0a20c7.FanTopPermissionV2.PermissionAdded', {
                    target: address(accounts["emulator-user-1"].address),
                    role: string("operator")
                })
            ),
            id: expect.any(String),
            payer: 'f8d6e0586b0a20c7',
            payload: expect.any(String),
            status: 'SEALED'
        })
        expect(
            emulator.scripts('scripts/has_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        ).toEqual(bool(true))
    })

    // OwnerではないユーザーはOperatorを追加できない
    test('Non-Owner users cannot add Operator', () => {
        expect(() =>
            emulator.signer("emulator-user-2").transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        ).toThrowError('FanTopPermissionV2.hasPermission(account.address, role: Role.owner)')
    })

    // Ownerは重複してOperatorを追加できない
    test('Owner cannot add Operator more than once', () => {
        emulator.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        expect(() =>
            emulator.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        ).toThrowError('error: pre-condition failed: Permission that already exists cannot be added')
    })

})

describe('Minter', () => {
    let emulator: FlowEmulator

    beforeAll(async () => {
        emulator = await createEmulator()
    })

    afterAll(() => {
        emulator?.terminate()
    })

    beforeEach(async ()=> {
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("operator")) } catch { /* NOP */ }
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("minter")) } catch { /* NOP */ }
    })

    // OwnerはMinterを追加できる
    test('Owner can add Minter', () => {
        expect(
            emulator.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
        ).toEqual({
            authorizers: '[f8d6e0586b0a20c7]',
            events: events(
                event('A.f8d6e0586b0a20c7.FanTopPermissionV2.PermissionAdded', {
                    target: address(accounts["emulator-user-1"].address),
                    role: string("minter")
                })
            ),
            id: expect.any(String),
            payer: 'f8d6e0586b0a20c7',
            payload: expect.any(String),
            status: 'SEALED'
        })

        expect(
            emulator.scripts('scripts/has_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
        ).toEqual(bool(true))
    })

    // Ownerは重複してMinterを追加できない
    test('Owner cannot add Minter more than once', () => {
        emulator.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
        expect(() =>
            emulator.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
        ).toThrowError('error: pre-condition failed: Permission that already exists cannot be added')
    })
})

describe('Other', () => {
    let emulator: FlowEmulator

    beforeAll(async () => {
        emulator = await createEmulator()
    })

    afterAll(() => {
        emulator?.terminate()
    })

    beforeEach(async ()=> {
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("operator")) } catch { /* NOP */ }
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("minter")) } catch { /* NOP */ }
    })

    // 存在しないRoleは追加できない
    test('Roles that do not exist cannot be added', () => {
        expect(() =>
            emulator.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("abc"))
        ).toThrowError('error: panic: Unknown roles cannot be added')
    })

    // Ownerは追加できない
    test('Owner cannot be added', () => {
        expect(() => {
            emulator.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("owner"))
        }).toThrowError('error: pre-condition failed: Owner cannot be changed')
    })
})
