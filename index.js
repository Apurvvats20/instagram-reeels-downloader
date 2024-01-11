const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function getDataFromSheet() {
  const url =
    "https://script.googleusercontent.com/a/macros/quinn.live/echo?user_content_key=iqfWuRsdqO-rOCtrVAggknC39AJi5-KZXeh9iq5BQNo1IVUrzbsdyHR6Y147lkMPMj6roL2MhUpn-rvVmL4uCv-SUqpbCSCym5_BxDlH2jW0nuo2oDemN9CCS2h10ox_nRPgeZU6HP_qtl6nTkLa8y8r2pePY-9AoIVocrW5rgFShPQPxwOP701fty0LXEOTif837GcslapoU9SApLQJgAGM2zAAGWT_Q4GNYqRaet0Iv-QCmgZi0UyFwmZL3af8XMuqa_jo9BU&lib=M-7BkYSE2PMjos3Ut74cT11FCiDxBYoa2";

  try {
    const response = await fetch(url);
    const dataFromSheet = await response.json();
    const instagramLinks = Array.from(dataFromSheet.data);
    return instagramLinks;
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function downloadVideos() {
  let parsedData = await getDataFromSheet();
  let index = 0;

  const intervalId = setInterval(() => {
    const elem = parsedData[index];

    if (!elem || elem < 2) {
      clearInterval(intervalId);
      console.log("Download aborted or all videos downloaded");
      return;
    }
    instaVideoDonwloader(elem, index);
    console.log(`${index + 1} video downloaded`);
    index++;
  }, 2000);
}

downloadVideos();

async function instaVideoDonwloader(url, index) {
  const options = {
    method: "GET",
    url: "https://instagram-post-reels-stories-downloader.p.rapidapi.com/instagram/",
    params: {
      url: url,
    },
    headers: {
      "X-RapidAPI-Key": "45efa263aamsha3e7864ccfc0fe2p1a2f09jsn13726e9f2760",
      "X-RapidAPI-Host":
        "instagram-post-reels-stories-downloader.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);
    let downloadURL = response.data.result[0].url;

    async function downloadVideo(downloadURL, directory) {
      try {
        const videoResponse = await axios.get(downloadURL, {
          responseType: "stream",
        });
        const fileName = 1;
        const videoFilePath = path.join(directory, `video${index}.mp4`);
        console.log("Downloading to:", videoFilePath);
        const videoStream = fs.createWriteStream(videoFilePath);
        videoResponse.data.pipe(videoStream);
        videoStream.on("finish", () => {
          console.log("Video downloaded successfully.");
        });

        videoStream.on("error", (error) => {
          console.error("Error writing video stream:", error);
        });
      } catch (error) {
        console.log(`${error} : some error while downloading videos`);
      }
    }
    downloadVideo(downloadURL, "Downloadedvideos");
  } catch (error) {
    console.error(error);
  }
}
