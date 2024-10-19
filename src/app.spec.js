const { LyricsCompletion } = require("./openai");
const { main } = require("./suno");

xdescribe("OpenAI Integration Test", () => {
  it("should return a completion from OpenAI", async () => {
    const response = await LyricsCompletion({
      theme: "Natal",
      genre: "Música infantil",
      context:
        "Música animada e muito divertida para crianças aprenderem e se divertirem",
      language: "português do brasil",
    });

    console.log(response); // Optional: log the output to the console
  });
});

describe.only("Suno Integration Test", () => {
  it("should return a song from Suno", async () => {
    await main();
  });
});
