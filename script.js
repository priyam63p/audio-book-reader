const video = document.querySelector("video")
const textElem = document.querySelector("[data-text]")

async function setup() {
  try {
    textElem.textContent = "Loading Tesseract and turning on camera..."

    // 1. Load webcam and Tesseract concurrently to avoid delays
    const streamPromise = navigator.mediaDevices.getUserMedia({ video: true })
    const workerPromise = Tesseract.createWorker("eng")

    const [stream, worker] = await Promise.all([streamPromise, workerPromise])

    // 2. Attach stream to video and play
    video.srcObject = stream
    await video.play()

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth || 720
    canvas.height = video.videoHeight || 560

    textElem.textContent = "Ready! Point camera at text and press [Spacebar]."

    // 3. Listen for Spacebar press
    document.addEventListener("keypress", async e => {
      if (e.code !== "Space") return

      // Update canvas size to match live video dimensions
      canvas.width = video.videoWidth || video.width
      canvas.height = video.videoHeight || video.height

      // Draw current video frame to canvas
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height)
      
      textElem.textContent = "Scanning text..."

      const {
        data: { text },
      } = await worker.recognize(canvas)

      const cleanedText = text.trim()
      textElem.textContent = cleanedText || "No text detected. Try again."

      if (cleanedText) {
        speechSynthesis.speak(
          new SpeechSynthesisUtterance(cleanedText.replace(/\s/g, " "))
        )
      }
    })
  } catch (err) {
    console.error("Setup error:", err)
    textElem.textContent = "Error: " + err.message + ". Make sure you allowed camera access and are running via a local server."
  }
}

setup()