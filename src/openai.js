const { z } = require("zod");
const OpenAI = require("openai");
const assert = require("node:assert");
const {zodResponseFormat} = require("openai/helpers/zod");

const systemRole = {
  role: "system",
  content: "You are a senior song composer and digital production specialist, skilled at creating hit songs for various entertainment purposes. Your role is to generate lyrics and titles for songs in collaboration with AI tools. Use the given theme, musical genre, context, and language to produce engaging lyrics. You will also coordinate with other AI modules to create visuals, audio demos, and captions. Ensure the final product is optimized for social media platforms like YouTube and TikTok.",
};

const LyricsSchema = z.object({
  title: z.string().nonempty(),
  lyrics: z.object({
    verse1: z.array(z.string()).min(2).max(4),
    chorus: z.array(z.string()).min(2).max(4),
    verse2: z.array(z.string()).min(2).max(4),
    outro: z.array(z.string()).min(1).max(2).optional(),
    finalStructure: z.array(z.union([
      z.literal("verse1"),
      z.literal("chorus"),
      z.literal("verse2"),
      z.literal("chorus"),
      z.literal("outro"),
      z.literal("chorus")
    ]))
    .refine((structure) => {
      const correctStructure = ["verse1", "chorus", "verse2", "chorus", "outro", "chorus"];
      return JSON.stringify(structure) === JSON.stringify(correctStructure.slice(0, structure.includes("outro") ? 6 : 5));
    })
  })
});

const lyrics = {
  prompt: ({ theme, genre, context, language } = {}) =>
    `Write song lyrics about the theme "${theme}" in the style of ${genre} music. The song should be short and suitable for Youtube and TikTok platforms, lasting 2 to 3 minutes, and written in ${language}. Structure the song as follows: 
    - Two short verses, each 2-4 lines.
    - A simple, catchy chorus, 2-4 lines, repeated at least three times throughout.
    - An optional short outro, 1-2 lines, to end the song.
    Ensure the lyrics reflect the context: "${context}", and are engaging, memorable, and easy to sing along to.`,
  schema: LyricsSchema,
};

const image = {
  prompt: ({ lyrics, style } = {}) =>
    `Create an image to illustrate the following song lyrics: "${lyrics}". The image should visually match the themes and emotions expressed in the lyrics and be created in the following style: "${style}". Ensure that the image is evocative and complements the song's atmosphere.`,
};

module.exports = ({apiKey}) => { 
  
  const openai = new OpenAI({apiKey});

  const lyricsGeneration = async ({ theme, genre, context, language }) => {
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
  
    const prompt = lyrics.prompt({
      theme,
      genre,
      context,
      language,
    });
  
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemRole, { role: "user", content: prompt }],
      response_format: zodResponseFormat(lyrics.schema, "event"),
    });
  
    return completion.choices[0].message.parsed;
  };
  
  const imageGeneration = async ({ lyrics, style }) => {
    assert(
      typeof lyrics === "string" || lyrics instanceof String,
      new Error("Required field: lyrics")
    );
    assert(
      typeof style === "string" || style instanceof String,
      new Error("Required field: style")
    );
  
    const prompt = image.prompt({
      style,
      lyrics,
    });
  
    const completion = await openai.images.generate({
      n: 1,
      prompt,
      model: "dall-e-3",
      size: "1024x1024",
    });
  
    return response.data[0].url;
  };

  return {imageGeneration, lyricsGeneration};
};
