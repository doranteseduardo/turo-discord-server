import { SlashCommandBuilder } from "discord.js";
import { ICommand } from "../interfaces/ICommand";
import { ITuroResponse } from "../interfaces/ITuroResponse";
const fetch = require("node-fetch");

// This askCommand const will hold the ICommand object,
// which has data about the command, and an execute function
// which gets run when a user types the command.
const turoCommand: ICommand = {
  // To properly organize each command's information,
  // you must create a SlashCommandBuilder object, and
  // set its properties - here its name and description.

  // If you wanted to add an argument for your commands for instance,
  // you would do that with one of the SlashCommandBuilder's methods.
  // The "Slash Commands" section from "discordjs.guide" has really
  // good information about how to do that.
  data: new SlashCommandBuilder()
    .setName("turo")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Your question for Turo")
        .setRequired(true)
    )
    .setDescription("Ask Turo anything about Pokémon UNITE!"),

  // Here, we define the execute function, which gets run
  // when a user sends the command in to the bot. In this case,
  // it simply replies to the user with the string "pong!"
  async execute(interaction) {
    const reason = interaction.options.get("prompt") ?? "";

    if (!reason) {
      await interaction.reply("You can not pass an empty prompt!");
      return;
    }

    await interaction.deferReply();

    const request = await fetch(process.env.TURO_URL, {
      method: "post",
      body: JSON.stringify({
        query: reason.value,
      }),
      headers: {
        "Content-Type": "application/json",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.RAPIDAPI_HOST,
          "Content-Type": "application/json",
        },
      },
    });

    if (request) {
      const response: ITuroResponse = (await request.json()) as ITuroResponse;
      if (response.content?.length > 2000) {
        await interaction.editReply(
          "I'm sorry I can not process your request."
        );
      } else {
        await interaction.editReply(response.content);
      }
    } else {
      await interaction.editReply("I'm sorry I can not process your request.");
    }
  },
};

// This is super important and allows other
// .ts files in the project to access the
// ICommand object created above!
module.exports = turoCommand;
