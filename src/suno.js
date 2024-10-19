const axios = require("axios");
const path = require("node:path");
const {ensureFile, outputFile} = require("fs-extra");

// replace your vercel domain
const baseUrl = "http://localhost:3000";

async function customGenerateAudio(payload) {
  const url = `${baseUrl}/api/custom_generate`;
  const response = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

async function generateAudioByPrompt(payload) {
  const url = `${baseUrl}/api/generate`;
  const response = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

async function extendAudio(payload) {
  const url = `${baseUrl}/api/extend_audio`;
  const response = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

async function getAudioInformation(audioIds) {
  const url = `${baseUrl}/api/get?ids=${audioIds}`;
  const response = await axios.get(url);
  return response.data;
}

async function getQuotaInformation() {
  const url = `${baseUrl}/api/get_limit`;
  const response = await axios.get(url);
  return response.data;
}

async function getClipInformation(clipId) {
  const url = `${baseUrl}/api/clip?id=${clipId}`;
  const response = await axios.get(url);
  return response.data;
}

async function main() {
  const res = await generateAudioByPrompt({
    prompt:
      "A popular heavy metal song about war, sung by a deep-voiced male singer, slowly and melodiously. The lyrics depict the sorrow of people after the war.",
    make_instrumental: false,
    wait_audio: false,
  });

  const ids = `${res[0].id},${res[1].id}`;
  console.log(`ids: ${ids}`);

  for (let i = 0; i < 60; i++) {
    const info = await getAudioInformation(ids);
    if (info[0].status === "streaming") {
      console.log(`${info[0].id} ==> ${info[0].audio_url}`);
      console.log(`${info[1].id} ==> ${info[1].audio_url}`);
      
      fileName = "test.mp3"
      const filePath = path.join("temp", "1", "audio", fileName);
      await ensureFile(filePath);

      const {data} = await axios.request({
        method: 'GET',
        decompress: true,
        url: info[1].audio_url,
        responseType: 'arraybuffer',
      });

      console.log(data);

      await outputFile(filePath, data, "binary");

      break;
    }
    // sleep 5s
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

module.exports = { main };