require("dotenv").config();
const OpenAI = require("openai");
const assert = require("node:assert");

const systemRole = {
  role: "system",
  content: "You are a helpful assistant",
};

const lyricsSchema = {
  prompt: ({ theme, genre, context, language } = {}) =>
    `Crie uma letra de música sobre o tema  ${theme}, do seguinte gênero musical:  ${genre}. ${context}. No idioma: ${language}`,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LyricsCompletion = async ({ theme, genre, context, language }) => {
  assert(
    typeof theme === "string" || theme instanceof String,
    new Error("Required field: theme")
  );
  assert(
    typeof genre === "string" || genre instanceof String,
    new Error("Required field: genre")
  );
  assert(
    typeof context === "string" || context instanceof String,
    new Error("Required field: context")
  );
  assert(
    typeof language === "string" || language instanceof String,
    new Error("Required field: language")
  );

  const prompt = lyricsSchema.prompt({
    theme,
    genre,
    context,
    language,
  });

  const completion = await openai.chat.completions.create({
    messages: [systemRole, { role: "user", content: prompt }],
    model: "gpt-4o",
  });

  console.log(completion.choices[0].message.content);

  return completion.choices[0].message.content;
};

module.exports = { LyricsCompletion };
