const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const sources = [
    {
        name: 'Etherscan',
        address: 'https://etherscan.io/tokens',
        base: 'https://etherscan.io'
    }
]

const coin_results = []

sources.forEach(token => {
    axios.get(token.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            $('tr', html).each(function () {
                // This pulls only the name of the coin from the a tag
                const coin = $(this).find('a').text()
                
                // This pulls the address of the coin from the a tag with the href attribute
                const url = $(this).find('a').attr('href')
                const url_clean = url.replace('=desc', '=ascend')

                // This pulls the price of the coin from the td tag, however it is a tad messy with Etherscans layout.
                const price = $(this).find('td').eq(2).text()
                const price_clean = price.replace('0.', ' OR 0.')
                const price_final = price_clean.replace('Btc', 'Btc OR ')
                
                // This pulls the change percentage of the coin from the td tag
                const change = $(this).find('td').eq(3).text()

                // This pulls the volume of the coin from the td tag
                const volume = $(this).find('td').eq(4).text()

                // This pulls the market cap of the coin from the td tag
                const market_cap = $(this).find('td').eq(5).text()

                // This pulls the on chain market cap of the coin from the td tag
                const on_chain_market_cap = $(this).find('td').eq(6).text()

                // This pulls the current holders of the coin from the td tag
                const holders = $(this).find('td').eq(7).text()
                const holders_clean = holders.replace(' ', ' Percentage: ')

                coin_results.push({
                    coin,
                    url: token.base + url_clean,
                    price: price_final,
                    change_percent: change,
                    volume_24h: volume,
                    circulating_market_cap: market_cap,
                    on_chain_market_cap: on_chain_market_cap,
                    holders: holders_clean
                })
            })
        })
})

app.get('/', (req, res) => {
    res.json('Etherscan ERC20 Top Movers API. /tokens')
})

app.get('/tokens', (req, res) => {
    res.json(coin_results)
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))