require("dotenv").config();
const { main } = require("./suno");
const openaiModule = require("./openai");

const openai = openaiModule({apiKey: process.env.OPENAI_API_KEY})

describe("OpenAI Integration Test", () => {
  describe("Lyrics Generation", () => {
    it.only("should return a completion from OpenAI", async () => {
      const response = await openai.lyricsGeneration({
        theme: "Natal",
        genre: "Música infantil",
        context:
          "Música animada e muito divertida para crianças aprenderem e se divertirem",
        language: "português do brasil",
      });
  
      console.log(response); // Optional: log the output to the console
    });
  });
  
});

xdescribe("Suno Integration Test", () => {
  it("should return a song from Suno", async () => {
    await main();
  });
});
