import { createEmulator, FlowEmulator } from "./__fixtures__/emulator"
import { accounts } from '../flow.json'
import { address, bool, int, string } from "./__fixtures__/args"
import { signSellOrder } from "./__fixtures__/sign-sell-order"

const additionalKey = {
    index: 1,
    privateKey: 'c4984d0beec74cb84c9f6c5c421a0e9be9d0377d9bdf1447bca2bdb8256fa60e',
    publicKey: '1fbbfc22c264d495a3e6d375416f1d5867b225ff7099dd9423d12611fb96344c57d34638f8b07e84be254630ea84ad9a568fc51bc50da94c63edbcec8df6481c'
}


let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('agent').transactions('transactions/account/add_public_key.cdc', string(additionalKey.publicKey))
})

afterAll(() => {
    emulator?.terminate()
})

// 署名が一致する
test('Signature matches', () => {
    const { signature, signedData } = signSellOrder({
        agent: accounts.agent.address,
        from: accounts["emulator-user-1"].address,
        orderId: 'order-id-1',
        refId: 'ref-id-1',
        nftId: 123,
        version: 1234,
        metadata: ['exInfo', 'exInfo'],
        key: {
            index: 0,
            privateKey: accounts.agent.key
        }
    })

    expect(
        emulator.scripts('./scripts/test_signature.cdc', string(signature), string(signedData), address(accounts.agent.address), int(0))
    ).toEqual(bool(true))
})

// 署名が一致しない
test('Signatures do not match', () => {
    const { signedData } = signSellOrder({
        agent: accounts.agent.address,
        from: accounts["emulator-user-1"].address,
        orderId: 'order-id-1',
        refId: 'ref-id-1',
        nftId: 123,
        version: 1234,
        metadata: ['exInfo', 'exInfo'],
        key: {
            index: 0,
            privateKey: accounts.agent.key
        }
    })

    const { signature } = signSellOrder({
        agent: accounts.agent.address,
        from: accounts["emulator-user-1"].address,
        orderId: 'order-id-1',
        refId: 'ref-id-1',
        nftId: 123,
        version: 1234,
        metadata: ['exInfo', 'aaaa'], // do no match
        key: {
            index: 0,
            privateKey: accounts.agent.key
        }
    })

    expect(
        emulator.scripts('./scripts/test_signature.cdc', string(signature), string(signedData), address(accounts.agent.address), int(0))
    ).toEqual(bool(false))
})

// keyIndexを指定できる
test('keyIndex can be specified', () => {
    const { signature, signedData } = signSellOrder({
        agent: accounts.agent.address,
        from: accounts["emulator-user-1"].address,
        orderId: 'order-id-1',
        refId: 'ref-id-1',
        nftId: 123,
        version: 1234,
        metadata: ['exInfo', 'exInfo'],
        key: additionalKey // keyIndex: 1
    })

    expect(
        emulator.scripts('./scripts/test_signature.cdc', string(signature), string(signedData), address(accounts.agent.address), int(additionalKey.index)) // keyIndex: 1
    ).toEqual(bool(true))
})

// 取り消された鍵は使用できない
test('Revoked key cannot be used', () => {
    emulator.signer('agent').transactions('transactions/account/remove_public_key.cdc', int(additionalKey.index)) // keyIndex: 1

    const { signature, signedData } = signSellOrder({
        agent: accounts.agent.address,
        from: accounts["emulator-user-1"].address,
        orderId: 'order-id-1',
        refId: 'ref-id-1',
        nftId: 123,
        version: 1234,
        metadata: ['exInfo', 'exInfo'],
        key: additionalKey // keyIndex: 1
    })

    expect(() =>
        emulator.scripts('./scripts/test_signature.cdc', string(signature), string(signedData), address(accounts.agent.address), int(additionalKey.index)) // keyIndex: 1
    ).toThrowError('error: assertion failed: Revoked keys cannot be used')
})
