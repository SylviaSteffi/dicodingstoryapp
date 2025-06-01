export default class Camera {
  #streaming = false;
  #width = 640;
  #height = 0;
  #videoElement;
  #canvasElement;
  #takePictureButton;

  constructor({ video, canvas, options = {} }) {
    this.#videoElement = video;
    this.#canvasElement = canvas;

    this.#initialListener();
  }

  #initialListener() {
    this.#videoElement.oncanplay = () => {
      if (this.#streaming) {
        return;
      }

      this.#height =
        (this.#videoElement.videoHeight * this.#width) /
        this.#videoElement.videoWidth;

      this.#canvasElement.setAttribute("width", this.#width);
      this.#canvasElement.setAttribute("height", this.#height);

      this.#streaming = true;
    };
  }

  async #getStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 4 / 3,
        },
      });

      return stream;
    } catch (error) {
      console.error("#getStream: error:", error);
      return null;
    }
  }

  async launch() {
    const stream = await this.#getStream();
    if (stream) {
      this.#videoElement.srcObject = stream;
      this.#videoElement.play();

      this.#clearCanvas();
    }
  }

  stop() {
    if (this.#videoElement && this.#videoElement.srcObject) {
      const tracks = this.#videoElement.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      this.#videoElement.srcObject = null;
    }
    this.#streaming = false;
    this.#clearCanvas();
  }

  #clearCanvas() {
    const context = this.#canvasElement.getContext("2d");
    context.fillStyle = "#AAAAAA";
    context.fillRect(
      0,
      0,
      this.#canvasElement.width,
      this.#canvasElement.height,
    );
  }

  async takePicture() {
    if (!(this.#width && this.#height)) {
      return null;
    }

    const context = this.#canvasElement.getContext("2d");

    this.#canvasElement.width = this.#width;
    this.#canvasElement.height = this.#height;

    context.drawImage(this.#videoElement, 0, 0, this.#width, this.#height);

    return await new Promise((resolve) => {
      this.#canvasElement.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  }

  addCheeseButtonListener(selector, callback) {
    this.#takePictureButton = document.querySelector(selector);
    this.#takePictureButton.onclick = callback;
  }
}
