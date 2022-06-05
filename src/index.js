const { Telegraf, Markup } = require('telegraf')
const { messages } = require('./messages/messages')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)
let current_step = 0
let is_ready_to_work = null
let contact_on_telegram = true

bot.start(async (ctx) => {
	if (current_step !== -1) {
		current_step = 0;
		await ctx.reply(messages.start_step.message)
		return current_step++
	}
})

bot.on('message', async (ctx) => {
	console.log('current_step:', current_step);

	if (current_step === 1) {
		if (ctx.update?.message?.text.includes('+')) {
			await ctx.reply(messages.first_step.message)
			return current_step++
		} else {
			await ctx.reply('Извини, я не понимаю тебя. Пожалуйста, следуй сообщению в инструкции')	
		}
	}
	
	if (current_step === 2) {
		if (
			Number(ctx.update?.message?.text)
			|| ctx.update?.message?.text.includes('лет')
			|| ctx.update?.message?.text.includes('год')
		) {
			await ctx.reply(messages.second_step.message)
			return current_step++
		} else {
			await ctx.reply('Пожалуйста, укажи свой возраст цифрой')
		}
	}
	
	if (current_step === 3) {
		await ctx.reply(messages.third_step.message)
		return current_step++
	}
	
	if (current_step === 4) {
		await ctx.reply(messages.fourth_step.message, Markup.inlineKeyboard(
			messages.fourth_step.buttons.map((button, index) => {
				return [Markup.button.callback(button, `desired-earnings-button-${index}`)]
			})
		))
		return current_step++
	}
	
	// buttons ...

	if (current_step === 9) {
		await ctx.reply(messages.ninth_step.message)
		
		return current_step = -1
	}
})

const onClickButton = (id) => {
	bot.action(id, async (ctx) => {
		try {
			await ctx.answerCbQuery()
						
			// Next step
			if (current_step === 5) {
				// Save choosed value to DB
				console.log('Choosed desired earnings value:', id);

				await ctx.reply(messages.fifth_step.message, Markup.inlineKeyboard(
					messages.fifth_step.buttons.map((button, index) => {
						return [Markup.button.callback(button, `content-button-${index}`)]
					})
				))

				return current_step++
			}

			if (current_step === 6) {
				// Save choosed value to DB
				console.log('Choosed content value:', id);
	
				await ctx.reply(messages.sixth_step.message, Markup.inlineKeyboard(
					messages.sixth_step.buttons.map((button, index) => {
						return [Markup.button.callback(button, `know-details-button-${index}`)]
					})
				))
				return current_step++
			}

			if (current_step === 7) {
				// Save choosed value to DB
				console.log('Know details value:', id);

				const is_model_ready = id === 'know-details-button-0'

				if (is_model_ready) {
					await ctx.reply(messages.seventh_step.message, Markup.inlineKeyboard(
						messages.seventh_step.buttons.map((button, index) => {
							return [Markup.button.callback(button, `contact-button-${index}`)]
						})
					))
					return current_step++
				} else {
					await ctx.reply('пока + блок бот')
					return current_step = -1
				}
			}

			if (current_step === 8) {
				contact_on_telegram = id === 'contact-button-0'

				if (contact_on_telegram) {
					await ctx.reply(messages.ninth_step.message)
					return current_step++
				} else {
					await ctx.reply(messages.eighth_step.message)
					return current_step++
				}
			}
		} catch (error) {
			// ...
		}
	})
}

// Handling the buttons
messages.fourth_step.buttons.forEach((button, index) => {
	onClickButton(`desired-earnings-button-${index}`)
})

// Handling the buttons
messages.fifth_step.buttons.forEach((button, index) => {
	onClickButton(`content-button-${index}`)
})

// Handling the buttons
messages.sixth_step.buttons.forEach((button, index) => {
	onClickButton(`know-details-button-${index}`)
})

// Handling the buttons
messages.seventh_step.buttons.forEach((button, index) => {
	onClickButton(`contact-button-${index}`)
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
