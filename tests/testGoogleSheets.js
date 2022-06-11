const writeAnswers = require('../src/writeAnswers');

const testDataToTable = async () => {
    const result = await writeAnswers.googleSheets({
        age: '63',
        dreamCountry: 'Молдова',
        own_country: 'Великобритания',
        dreamMoney: '2️⃣ 2000-2500$',
        content: '1️⃣ Уровня Инстаграм / Тик-ток / Соц.сети 📷',
        is_model_ready: true,
        contact_on_telegram: false,
        other_contact: 'Скайп: 777'
    })
    console.log(result)
}

module.exports = testDataToTable
