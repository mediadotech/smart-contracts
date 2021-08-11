import { execSync, spawn } from 'child_process'
import { SIGTERM } from 'constants'
import { accounts } from '../../flow.json'
import { address, dicss, json, string, uint32, bool } from './args'
import waitPort from 'wait-port'


type AccountName = keyof typeof accounts

const HTTP_PORT_OFFSET = 4511 // 3570 + 4511 = 8081

export interface FlowEmulator {
    terminate(): void
    readonly stdout: string
    readonly stderr: string
    readonly error?: Error
    readonly port: number
    exec(subCommand: string): any
    transactions(path: string, ...args: any[]): {
        authorizers: string
        events: any[]
        id: string
        payer: string
        payload: string
        status: string
        [key: string]: any
    }
    scripts(path: string, ...args: any[]): object
    createItem(args: {
        itemId: string, version: number, limit: number, metadata?: {[key: string]: string}, active?: boolean
    }): void
    mintToken(args: {
        recipient: AccountName, refId: string, itemId: string, metadata: {[key: string]: string}
    }): number
    readonly options: string[]
    withOptions(...args: string[]): FlowEmulator
    signer(signer: AccountName): FlowEmulator
}

export async function createEmulator(): Promise<FlowEmulator> {
    const port = 3569 + Number(process.env.JEST_WORKER_ID || 1)
    const host = `localhost:${port}`
    let error
    let stdout = ''
    let stderr = ''
    const child = spawn('flow', [
        'emulator', 'start',
        '--http-port', (port + HTTP_PORT_OFFSET).toString(),
        '--port', port.toString()], {
        detached: true
    })
    child.on('error', (err) => {
        error = err
    })
    child.stdout.on('data', (chunk) => {
        stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
        stderr += chunk.toString()
    })

    const execFlow = (flowCommand: string) => {
        if (!flowCommand.startsWith('flow ')) {
            throw new Error('That command is not a flow command: ' + flowCommand)
        }
        const subCommand = flowCommand.slice(5)
        stdout = ''
        stderr = ''
        const command = 'flow --host ' + host + ' --output json ' + subCommand
        const json = execSync(command).toString()
        const result = JSON.parse(json)
        if (result.error) {
            throw new Error(result.error)
        }
        return result
    }

    try {
        await waitPort({ port, output: 'silent' }).then(open => { if (!open) { throw new Error(port + ' did not open') } })
        execFlow('flow accounts create --key ' + accounts['emulator-user-1'].pubkey)
        execFlow('flow accounts create --key ' + accounts['emulator-user-2'].pubkey)
        execFlow('flow transactions send transactions/minter/add_public_key.cdc --arg String:' + accounts['minter-1'].key.pubkey)
        execFlow('flow transactions send transactions/minter/add_public_key.cdc --arg String:' + accounts['minter-2'].key.pubkey)
        execFlow('flow project deploy')

        const emulator: FlowEmulator = {
            terminate: () => child.kill(SIGTERM),
            get stdout() {
                return stdout
            },
            get stderr() {
                return stderr
            },
            get error() {
                return error
            },
            get port() {
                return port
            },
            exec: execFlow,
            transactions(path, ...args) {
                return execFlow(`flow transactions send ${path} --args-json '${json(args)}' ${this.options.join(' ')}`)
            },
            scripts(path, ...args) {
                return execFlow(`flow scripts execute ${path} --args-json '${json(args)}'`)
            },
            createItem({ itemId, version = 1, limit = 1, metadata = {}, active = true }) {
                return this.transactions('transactions/operator/create_item.cdc', string(itemId), uint32(version), uint32(limit), dicss(metadata), bool(active))
            },
            mintToken({recipient, refId, itemId, metadata}) {
                return this.transactions('transactions/minter/mint_token.cdc', address('0x' + accounts[recipient].address), string(refId), string(itemId), dicss(metadata))
            },
            options: [],
            withOptions(...options) {
                return {
                    ...emulator,
                    options
                }
            },
            signer(signer) {
                return {
                    ...emulator,
                    options: [...this.options, '--signer', signer]
                }
            }
        }
        return emulator
    } catch (err) {
        child.kill(SIGTERM)
        throw err
    }
}
