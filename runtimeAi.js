import fs from 'fs'
import os from 'os'
import { sizeFormatter } from 'human-readable'
let formatSize = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: '2',
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
})

let handler = async (m, { conn }) => {
    let chats = Object.entries(conn.chats).filter(([a, b]) => a && b.isChats)
    let groups = Object.keys(await conn.groupFetchAllParticipating())
    let folder = /2/.test(process.argv[1]) ? './sessions2' : './sessions'
    let session = (eval(fs.readdirSync(folder).map(v => fs.statSync(folder + '/' + v).size).join('+')) / 1024 / 1024).toFixed(2)
    let txt = `
*▾ 𝓢𝓣𝓐𝓣𝓤𝓢 INFORMATION ▾*
			*° Totɑl Chɑts :* ${chats.length} Chɑts
			*° Group Chɑts :* ${groups.length} Chɑts
			*° Personɑl Chɑts :* ${chats.length - groups.length} Chɑts
			*° Runtime :* ( ${new Date(~~(process.uptime()) * 1000).toTimeString().split(' ')[0]} )

*▾ SERVER INFORMATION ▾*
			*° Plɑtform :* ${process.platform}
			*° Nodejs :* ${process.version}
			*° Session Size :* ${session} MB
			*° Memory :* ${formatSize(os.totalmem() - os.freemem())} / ${formatSize(os.totalmem())}
`
    m.reply(txt.trim())
}
handler.command = /^stats|status$/i

export default handler