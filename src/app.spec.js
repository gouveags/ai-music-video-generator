// const request = require("supertest");
const { LyricsCompletion } = require("./openai");

// // Use dynamic import to load ES modules
// let chai;
// (async () => {
//   chai = await import("chai");
//   const { expect } = chai;

//   const app = require("./app"); // Adjust the path if necessary

//   describe("POST /api", () => {
//     it('should respond with "hello world"', (done) => {
//       request(app)
//         .post("/api")
//         .send({ key: "value" })
//         .expect(200)
//         .expect("Content-Type", /text\/plain/)
//         .end((err, res) => {
//           if (err) return done(err);
//           expect(res.text).to.equal("hello world");
//           done();
//         });
//     });
//   });
// })();

describe.only("OpenAI Integration Test", () => {
  it("should return a completion from OpenAI", async () => {
    const response = await LyricsCompletion({
      theme: "Natal",
      genre: "Música infantil",
      context:
        "Música animada e muito divertida para crianças aprenderem e se divertirem",
      language: "português do brasil",
    });

    // // Assert that the response contains a message
    // expect(response).toHaveProperty("message");
    // expect(response.message).toHaveProperty("role", "assistant");
    // expect(response.message).toHaveProperty("content");

    console.log(response); // Optional: log the output to the console
  });
});
