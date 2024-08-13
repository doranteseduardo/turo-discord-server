import { SlashCommandBuilder } from "discord.js";
import { ICommand } from "../interfaces/ICommand";
import { ITuroResponse } from "../interfaces/ITuroResponse";
const fetch = require("node-fetch");

interface TuroRequest {
  query: string;
}

interface TuroErrorResponse {
  error: string;
}

const turoCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName("turo")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Your question for Turo")
        .setRequired(true)
    )
    .setDescription("Ask Turo anything about Pokémon UNITE!"),

  async execute(interaction) {
    const prompt = interaction.options.get("prompt") ?? "";

    if (!prompt) {
      await interaction.reply("You can not pass an empty prompt!");
      return;
    }

    await interaction.deferReply();

    try {
      const response = await makeTuroRequest(prompt.value as string);
      const turoResponse = await response.json();

      if (turoResponse.content && turoResponse.content.length > 2000) {
        await interaction.editReply(
          "I'm sorry I can not process your request."
        );
      } else {
        await interaction.editReply(turoResponse.content);
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply("I'm sorry I can not process your request.");
    }
  },
};

async function makeTuroRequest(prompt: string): Promise<Response> {
  if (
    !process.env.TURO_URL ||
    !process.env.RAPIDAPI_KEY ||
    !process.env.RAPIDAPI_HOST
  ) {
    throw new Error("Environment variables are not set");
  }

  const request: TuroRequest = {
    query: prompt,
  };

  try {
    return await fetch(process.env.TURO_URL, {
      method: "post",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = turoCommand;
