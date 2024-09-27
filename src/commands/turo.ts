import { SlashCommandBuilder } from "discord.js";
import { ICommand } from "../interfaces/ICommand";
import { ITuroResponse } from "../interfaces/ITuroResponse";
import dotenv from "dotenv";
const fetch = require("node-fetch");
dotenv.config();

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
    /*
    await interaction.reply(
      "Thanks for using Turo, but the service has been discontinued. Please try using the mobile app instead."
    );
    return;*/
    const reason = interaction.options.get("prompt")?.value ?? "";

    if (!reason) {
      await interaction.reply("You cannot pass an empty prompt!");
      return;
    }

    await interaction.deferReply();

    try {
      const response = await fetch(process.env.TURO_URL, {
        method: "POST",
        body: JSON.stringify({
          query: reason,
        }),
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        },
      });

      if (response.ok) {
        const data: ITuroResponse = await response.json();
        if (data.content?.length > 2000) {
          await interaction.editReply(
            "I'm sorry I cannot process your request."
          );
        } else {
          await interaction.editReply(data.content);
        }
      } else {
        await interaction.editReply("I'm sorry I cannot process your request.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      await interaction.editReply(
        "An error occurred while processing your request."
      );
    }
  },
};

// This is super important and allows other
// .ts files in the project to access the
// ICommand object created above!
module.exports = turoCommand;
