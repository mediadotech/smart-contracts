import elliptic from 'elliptic'
import { SHA3 } from 'sha3'
import { accounts } from '../../flow.json'

const ec = new elliptic.ec('p256')

function digestSHA3(data) {
    const sha = new SHA3(256)
    // Tag: '464c4f572d56302e302d75736572000000000000000000000000000000000000'
    // ref: https://github.com/onflow/flow-go-sdk/blob/9bb50d/sign.go
    const tagBytes = Buffer.alloc(32)
    Buffer.from('FLOW-V0.0-user').copy(tagBytes)
    const buffer = Buffer.concat([tagBytes, data])
    return sha.update(buffer).digest()
}

// Buffer.from(agent.key, 'hex')
function sign(message, privKey) {
    const key = ec.keyFromPrivate(privKey);
    const sig = key.sign(digestSHA3(message))
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, 'be', n);
    const s = sig.s.toArrayLike(Buffer, 'be', n);

    return Buffer.concat([r, s])
}

export type AccountKey = keyof typeof accounts
export interface FlowKey {
    index: number
    privateKey: string
}

export function getNormarizedFlowKey(account: AccountKey): FlowKey {
    const holder = accounts[account]
    let key: string
    if ('key' in holder) {
        key = 'key'
    } else if ('keys' in holder) {
        key = 'keys'
    } else {
        throw new Error('key not found in ' + account)
    }
    let value = holder[key]
    if (typeof(value) === 'string') {
        return {
            index: 0,
            privateKey: value
        }
    }
    return {
        index: value.index,
        privateKey: value.privateKey
    }
}

function createUint32BEBuffer(arg: number): Buffer {
    const buff = Buffer.alloc(4)
    buff.writeUInt32BE(arg)
    return buff
}

function createUint64BEBuffer(arg: number): Buffer {
    const buff = Buffer.alloc(8)
    buff.writeBigUInt64BE(BigInt(arg))
    return buff
}

function createKVSBuffer(arg: string[]): Buffer {
    const buffs: Buffer[] = []
    for (let i = 0; i < arg.length; i += 2) {
        const key = arg[i]
        const value = arg[i+1]
        buffs.push(Buffer.from(key, 'utf-8'))
        buffs.push(Buffer.from(value, 'utf-8'))
    }
    return Buffer.concat(buffs)
}


export function signSellOrder({
    agent, from, orderId, refId, nftId, version, metadata, key
}: {
    agent: string,
    from: string,
    orderId: string,
    refId: string,
    nftId: number,
    version: number,
    metadata: string[],
    key: FlowKey
}) {
    const privKey = Buffer.from(key.privateKey, 'hex')
    let buffer = Buffer.concat([
        Buffer.from(agent.replace(/^0x/, ''), 'hex'),
        Buffer.from(from.replace(/^0x/, ''), 'hex'),
        Buffer.from(orderId, 'utf-8'),
        Buffer.from(refId, 'utf-8'),
        createUint64BEBuffer(nftId),
        createUint32BEBuffer(version),
        createKVSBuffer(metadata),
        Buffer.from(key.index.toString(), 'utf-8')
    ])

    return {
        params: { agent, from, orderId, refId, nftId, version, metadata },
        signedData: buffer.toString('hex'),
        signature: sign(buffer, privKey).toString('hex')
    }
}
