const { GoogleSpreadsheet } = require('google-spreadsheet')
const creds = require('../.creds.json');

class WriteAnswers {
    async googleSheets(data) {
        const sheetId = process.env.GOOGLE_SHEET_ID
        const doc = new GoogleSpreadsheet(sheetId)
        await doc.useServiceAccountAuth(creds)
        await doc.loadInfo()
        const sheet = doc.sheetsByIndex[0]
        sheet.addRows([
            { question: '', answer: '' },
            { question: 'Имя юзера', answer: `${data.name} [@${data.username}]` },
            { question: 'Возраст', answer: data.age },
            { question: 'Желаю проживать в', answer: data.dreamCountry },
            { question: 'Проживаю в', answer: data.ownCountry },
            { question: 'Хочу зарабатывать', answer: data.dreamMoney },
            { question: 'Контент', answer: data.content },
            { question: 'Интересно?', answer: data.is_model_ready ? 'Да' : 'Нет' },
            { question: 'Альтернативный способ связи', answer: data.other_contact },
        ], { insert: true })
    }
}

const writeAnswers = new WriteAnswers()
module.exports = writeAnswers
