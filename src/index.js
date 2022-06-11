const fs = require('fs')
const { Telegraf, Markup } = require('telegraf')
const LocalSession = require('telegraf-session-local')
const testDataToTable = require('../tests/testGoogleSheets')
require('dotenv').config()
const { messages } = require('./messages/messages')
const writeAnswers = require('./writeAnswers')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use((new LocalSession({ database: 'session.json' })).middleware())

bot.start(async (ctx) => {
	// testDataToTable()
	
	// ctx.session.current_step = 'READY'
	// ctx.session.userData = {
	// 	name: `${ctx.message?.from?.first_name} ${ctx.message?.from?.last_name}`,
	// 	username: ctx.message?.from?.username,
	// 	id: ctx.message?.from?.id
	// }
	// await ctx.replyWithPhoto({ source: messages.start_step.photo })
	// return ctx.reply(messages.start_step.message)

	ctx.session.current_step = 'AGE'
	ctx.session.userData = {
		name: `${ctx.message?.from?.first_name} ${ctx.message?.from?.last_name}`,
		username: ctx.message?.from?.username,
		id: ctx.message?.from?.id
	}
	await ctx.replyWithPhoto({ source: messages.age.photo })
	return ctx.reply(messages.age.message)
})

bot.on('message', async (ctx) => {
	if (ctx.update?.message?.text !== undefined) {
		if (ctx.session.current_step === 'READY') {
			if (ctx.update?.message?.text.includes('+')) {
				ctx.session.current_step = 'AGE'
				await ctx.replyWithPhoto({ source: messages.age.photo })
				return ctx.reply(messages.age.message)
			} else {
				return ctx.reply('Извини, я не понимаю тебя. Пожалуйста, следуй сообщению в инструкции')
			}
		}
	
		if (ctx.session.current_step === 'AGE') {
			if (Number(ctx.update?.message?.text) || ctx.update?.message?.text.includes('лет') || ctx.update?.message?.text.includes('год')) {
				ctx.session.userData.age = ctx.update?.message?.text
				ctx.session.current_step = 'DREAM_COUNTRY'
				await ctx.replyWithPhoto({ source: messages.dreamCountry.photo })
				return ctx.reply(messages.dreamCountry.message)
			} else {
				return ctx.reply('Пожалуйста, укажи свой возраст цифрой')
			}
		}
	
		if (ctx.session.current_step === 'DREAM_COUNTRY') {
			ctx.session.userData.dreamCountry = ctx.update?.message?.text
			ctx.session.current_step = 'OWN_COUNTRY'
			return ctx.reply(messages.country.message)
		}
	
		if (ctx.session.current_step === 'OWN_COUNTRY') {
			ctx.session.userData.ownCountry = ctx.update?.message?.text
			ctx.session.current_step = 'DREAM_MONEY'
			await ctx.replyWithPhoto({ source: messages.dreamMoney.photo })
			return ctx.reply(messages.dreamMoney.message, Markup.inlineKeyboard(
				messages.dreamMoney.buttons.map((button, index) => {
					return [Markup.button.callback(button, `desired-earnings-button-${index}`)]
				})
			))
		}
	
		if (ctx.session.current_step === 'OTHER_CONTACT') {
			ctx.session.current_step = 'FINAL'
			ctx.session.userData.other_contact = ctx.update?.message?.text
			await ctx.replyWithPhoto({ source: messages.final.photo })
			await ctx.reply(messages.final.message)
			return writeAnswers.googleSheets(ctx.session.userData)
		}
	
		if (ctx.session.current_step === 'FINAL') {
			// The end
		}
	} else {
		return ctx.reply('Неверный формат ответа')
	}
})

const onClickButton = (id) => {
	bot.action(id, async (ctx) => {
		try {
			await ctx.answerCbQuery()

			if (ctx.session.current_step === 'DREAM_MONEY') {
				ctx.session.userData.dreamMoney = messages.dreamMoney.buttons[id.replace(/desired-earnings-button-/, '')]
				ctx.session.current_step = 'CONTENT'
				return ctx.reply(messages.content.message, Markup.inlineKeyboard(
					messages.content.buttons.map((button, index) => {
						return [Markup.button.callback(button, `content-button-${index}`)]
					})
				))
			}

			if (ctx.session.current_step === 'CONTENT') {
				ctx.session.userData.content = messages.content.buttons[id.replace(/content-button-/, '')]
				ctx.session.current_step = 'ABOUT'
				await ctx.replyWithPhoto({ source: messages.about.photo })
				return ctx.reply(messages.about.message, Markup.inlineKeyboard(
					messages.about.buttons.map((button, index) => {
						return [Markup.button.callback(button, `know-details-button-${index}`)]
					})
				))
			}

			if (ctx.session.current_step === 'ABOUT') {
				const is_model_ready = id === 'know-details-button-0'
				ctx.session.userData.is_model_ready = is_model_ready		
				if (is_model_ready) {
					if (ctx.update?.callback_query?.from?.username) {
						ctx.session.current_step = 'CONTACT_ON_TELEGRAM'
						return ctx.reply(messages.contact_on_telegram.message, Markup.inlineKeyboard(
							messages.contact_on_telegram.buttons.map((button, index) => {
								return [Markup.button.callback(button, `contact-button-${index}`)]
							})
						))
					} else {
						ctx.session.current_step = 'OTHER_CONTACT'
						return ctx.reply(messages.without_username.message)
					}
				} else {
					ctx.session.current_step = 1
					return ctx.replyWithHTML(messages.future.message)
				}
			}

			if (ctx.session.current_step === 'CONTACT_ON_TELEGRAM') {
				const contact_on_telegram = id === 'contact-button-0'
				ctx.session.userData.contact_on_telegram = contact_on_telegram

				if (contact_on_telegram) {
					ctx.session.current_step = 'FINAL'
					await ctx.replyWithPhoto({ source: messages.final.photo })
					await writeAnswers.googleSheets(ctx.session.userData)
					return ctx.reply(messages.final.message)
				} else {
					ctx.session.current_step = 'OTHER_CONTACT'
					return ctx.reply(messages.other_contact.message)
				}
			}

		} catch (error) {
			// ...
		}
	})
}

// Handling the buttons
messages.dreamMoney.buttons.forEach((button, index) => {
	onClickButton(`desired-earnings-button-${index}`)
})

// Handling the buttons
messages.content.buttons.forEach((button, index) => {
	onClickButton(`content-button-${index}`)
})

// Handling the buttons
messages.about.buttons.forEach((button, index) => {
	onClickButton(`know-details-button-${index}`)
})

// Handling the buttons
messages.contact_on_telegram.buttons.forEach((button, index) => {
	onClickButton(`contact-button-${index}`)
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
