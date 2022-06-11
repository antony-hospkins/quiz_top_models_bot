const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = JSON.parse(process.env.GOOGLE_API_CREDS);

class WriteAnswers {
    async googleSheets(data) {
        const sheetId = process.env.GOOGLE_SHEET_ID
        const doc = new GoogleSpreadsheet(sheetId)
        await doc.useServiceAccountAuth(creds)
        await doc.loadInfo()
        const sheet = doc.sheetsByIndex[0]
        sheet.addRows([
            {
                user_name: '',
                age: '', dream_country: '',
                current_country: '',
                want_to_earn: '',
                content: '',
                is_interesting: '',
                another_contact_method: ''
            },
            {
                user_name: `${data.username ? `@${data.username}` : '-'}`,
                age: data.age,
                dream_country: data.dreamCountry,
                current_country: data.ownCountry,
                want_to_earn: data.dreamMoney,
                content: data.content,
                is_interesting: data.is_model_ready ? 'Да' : 'Нет',
                another_contact_method: data.other_contact ?? '-'
            },
        ], { insert: true })
    }
}

const writeAnswers = new WriteAnswers()
module.exports = writeAnswers
