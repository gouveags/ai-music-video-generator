# AI Music Video Generator

**AI Music Video Generator** automates the creation of music videos by leveraging AI to generate song lyrics, images, music, and video content. It integrates OpenAI for lyric generation, DALL-E for image creation, Suno for music production, and FFmpeg for video processing. The tool simplifies video creation and automates uploading to platforms like YouTube and TikTok.

## Features

- **AI-Powered Lyric Generation**: Generate unique song lyrics based on user-specified themes, genres, and languages using OpenAI.
- **AI Image Generation**: Use DALL-E to create custom visuals that match the song lyrics and theme.
- **AI Music Generation**: Produce original music tracks tailored to the generated lyrics with Suno.AI.
- **Automated Video Creation**: Seamlessly combine generated lyrics, images, and music into a cohesive video using FFmpeg.
- **Platform Integration**: Automatically upload the generated music videos to platforms such as YouTube and TikTok.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14.x or later)
- OpenAI API key
- [Suno.AI](https://suno.com/) account with valid credentials (cookies may be required)
- [FFmpeg](https://ffmpeg.org/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/gouveags/ai-music-video-generator.git
   ```

2. Navigate to the project directory:

   ```bash
   cd ai-music-video-generator
   ```

3. Install the required dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory and add your API keys and necessary settings:
   ```bash
   OPENAI_API_KEY="your-openai-api-key"
   SUNO_COOKIES="your-suno-cookies"
   ```

### Running the Application

To start the development server, run:

```bash
npm run start:dev
```

This will start the server in development mode. The app will listen for user input to generate lyrics, images, music, and videos.

### Testing

To run the automated tests for the project, use the following command:

```bash
npm run test
```

This will execute all unit and integration tests.

## Contributing

We welcome contributions from the community! If you'd like to contribute, feel free to:

- Fork the repository
- Create a new branch for your feature or bugfix
- Submit a pull request (PR)

Please ensure your PR is well-documented and passes all tests.
