import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import flowConfig from '../../flow.json'
import { address, event, events, uint32, uint8, string, dicss, bool } from "../__fixtures__/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

// ロールを与えられていないユーザーはMinterとして活動できない
test('Users who are not given the role cannot act as Minter', () => {
    // As an Minter
    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/minter/mint_token.cdc',
            address(flowConfig.accounts['emulator-user-2'].address),
            string('test-ref-id-1'),
            string('test-item-id-1'),
            dicss({})
        )
    ).toThrowError('FanTopPermissionV2.hasPermission(account.address, role: Role.minter)')
})

// ロールを削除されたユーザーはMinterとして活動できない
test('User whose role has been deleted cannot act as Minter', () => {
    emulator.transactions('transactions/owner/add_admin.cdc', address(flowConfig.accounts["emulator-user-1"].address))
    emulator.signer('emulator-user-1').transactions('transactions/admin/add_minter.cdc', address(flowConfig.accounts["emulator-user-1"].address))
    emulator.transactions('transactions/owner/remove_permission.cdc', address(flowConfig.accounts["emulator-user-1"].address), string('minter'))

    // As an Minter
    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/minter/mint_token.cdc',
            address(flowConfig.accounts['emulator-user-2'].address),
            string('test-ref-id-1'),
            string('test-item-id-1'),
            dicss({})
        )
    ).toThrowError('FanTopPermissionV2.hasPermission(account.address, role: Role.minter)')
})
