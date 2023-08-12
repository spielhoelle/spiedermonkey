import { Dataset, KeyValueStore } from 'crawlee'
import fs from 'fs'
// import { datasetName } from './main'
const datasetName = 'rede';
(async () => {
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
    const dataset = await Dataset.open(datasetName)
    // calling reduce function and using memo to calculate number of headers
    let allInputs: { name: string, element: any }[] = []
    const pagesHeadingCount = await dataset.reduce((memo, value) => {
        if (value.body.indexOf("<form") !== -1) {
            const justFormElements = [...value.body.replace(/\n/g, '').matchAll(/<form.*?<\/form>/g)]
            justFormElements.forEach(match => {
                const inputs = [...match[0].matchAll(/<input.*?>/g)].map(input => input[0])
                inputs.forEach(input => {
                    const nameField = input.match(/name="(.*?)"/)
                    const typeField = input.match(/type="(.*?)"/)
                    if (nameField && nameField.length > 1) {
                        // if (valueField && valueField.length > 1) {
                        if (!selectors['em'].includes(nameField[1]) && typeField[1].includes('mail')) {
                            selectors['em'] = `${nameField[1]},${selectors['em']}`.replace(/,$/, '')
                        }
                        if (!selectors['ph'].includes(nameField[1]) && typeField[1].includes('tel')) {
                            selectors['ph'] = `${nameField[1]},${selectors['ph']}`.replace(/,$/, '')
                        }
                        if (!selectors['zp'].includes(nameField[1]) && nameField[1].includes("postal")) {
                            selectors['zp'] = `${nameField[1]},${selectors['zp']}`.replace(/,$/, '')
                        }
                        if (!selectors['fn'].includes(nameField[1]) && nameField[1].includes("first")) {
                            selectors['fn'] = `${nameField[1]},${selectors['fn']}`.replace(/,$/, '')
                        }
                        if (!selectors['ln'].includes(nameField[1]) && nameField[1].includes("last")) {
                            selectors['ln'] = `${nameField[1]},${selectors['ln']}`.replace(/,$/, '')
                        }
                        if (!selectors['st'].includes(nameField[1]) && nameField[1].includes("street")) {
                            selectors['st'] = `${nameField[1]},${selectors['st']}`.replace(/,$/, '')
                        }
                        if (!selectors['ct'].includes(nameField[1]) && nameField[1].includes("city")) {
                            selectors['ct'] = `${nameField[1]},${selectors['ct']}`.replace(/,$/, '')
                        }
                        if (!allInputs.map(i => i.name).includes(nameField[1])) {
                            allInputs.push({
                                name: nameField[1],
                                // type: typeField && typeField.length > 1 ? typeField[1] : 'text'
                                element: input
                            })
                        }
                    }
                })
                // @ts-ignore
                memo.push({
                    title: value.title,
                    form: match[0].replace(/.*(<form.*?>).*/, "$1"),
                    inputs,
                    selectors
                })
            })
        }
        return memo
    }, [])
    console.log('allInputs', allInputs.map(i => i.name))
    console.log('pagesHeadingCount', pagesHeadingCount)
    // saving result of map to default Key-value store
    // await KeyValueStore.setValue(datasetName + "_result", pagesHeadingCount)
    fs.writeFileSync(`result_${datasetName}.json`, JSON.stringify(pagesHeadingCount, null, 2))
})()



