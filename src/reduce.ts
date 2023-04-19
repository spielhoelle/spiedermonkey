import { Dataset, KeyValueStore } from 'crawlee'
import fs from 'fs'
// import { datasetName } from './main'
const datasetName = 'rede';
(async () => {
    const dataset = await Dataset.open(datasetName)
    // calling reduce function and using memo to calculate number of headers
    let selectors = {
        "em": "",
        "fn": "",
        "ln": "",
        "ph": "",
        "ct": "",
        "st": "",
        "zp": "",
        "country": ""
    }
    const pagesHeadingCount = await dataset.reduce((memo, value) => {
        if (value.body.indexOf("<form") !== -1) {
            const justFormElements = [...value.body.replace(/\n/g, '').matchAll(/<form.*?<\/form>/g)]
            justFormElements.forEach(match => {
                let allInputs = []
                const inputs = [...match[0].matchAll(/<input.*?>/g)].map(input => input[0])
                inputs.forEach(input => {
                    const nameField = input.match(/name="(.*?)"/)
                    const typeField = input.match(/type="(.*?)"/)
                    if (nameField && nameField.length > 1) {
                        // if (valueField && valueField.length > 1) {
                        if (nameField[1].includes('email')) {
                            selectors['em'] = `${selectors['em']},${nameField[1]}`
                        }
                        if (!allInputs.includes(nameField[1])) {
                            allInputs.push({
                                name: nameField[1],
                                type: typeField && typeField.length > 1 ? typeField[1] : 'text'
                            })
                        }
                        // }
                    }
                })
                // @ts-ignore
                memo.push({
                    title: value.title,
                    form: match[0].replace(/.*(<form.*?>).*/, "$1"),
                    // inputs
                    allInputs
                })
            })
        }
        return memo
    }, [])
    console.log('selectors', selectors)
    // saving result of map to default Key-value store
    // await KeyValueStore.setValue(datasetName + "_result", pagesHeadingCount)
    fs.writeFileSync(`result_${datasetName}.json`, JSON.stringify(pagesHeadingCount, null, 2))
})()



