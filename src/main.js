import readline from "readline";
import { AppController } from "./app.js";
import { lyricsInputSchema } from "./LyricsGenerator.js";

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  if (process.argv.includes("-h")) return AppController.listOptions();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const inputs = {
    mood: undefined,
    genre: undefined,
    topic: undefined,
  };

  while (inputs.mood === undefined) {
    const mood = await askQuestion(rl, "What is your mood like today? ");
    const parsed = lyricsInputSchema.shape.mood.safeParse(mood);

    if (!parsed.success) {
      console.error(parsed.error.errors[0].message);
      continue;
    }

    console.log(`Received mood: ${mood}! \n`);
    inputs.mood = mood;
  }

  while (inputs.genre === undefined) {
    const genre = await askQuestion(
      rl,
      "What genre would you like to listen to? "
    );
    const parsed = lyricsInputSchema.shape.genre.safeParse(genre);

    if (!parsed.success) {
      console.error(parsed.error.errors[0].message);
      continue;
    }

    console.log(`Received genre: ${genre}! \n`);
    inputs.genre = genre;
  }

  while (inputs.topic === undefined) {
    const topic = await askQuestion(
      rl,
      "Which topic would you like to listen while in the mood? "
    );
    const parsed = lyricsInputSchema.shape.topic.safeParse(topic);

    if (!parsed.success) {
      console.error(parsed.error.errors[0].message);
      continue;
    }

    console.log(`Received topic: ${topic}! \n`);
    inputs.topic = topic;
  }

  const app = new AppController();
  app.run(inputs);
}

main();
