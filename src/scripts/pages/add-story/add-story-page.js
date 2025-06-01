import AddStoryPresenter from "./add-story-presenter";
import { convertBase64ToBlob } from "../../utils/index.js";
import * as StoryAPI from "../../data/api.js";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import L from "leaflet";
import Camera from "../../utils/camera.js";

export default class AddStoryPage {
  #presenter = null;
  #form;
  #camera;
  #map = null;
  #zoom = 5;
  #hasClickedMap = false;
  #takenPhoto = null;

  async render() {
    return `
      <section class="addstory-container">
        <div class="addstory-form-container">
          <h1 id="addstory-title">Buat Story</h1>
          <form
            id="addstory-form"
            class="addstory-form"
            aria-labelledby="addstory-title"
          >
            <div class="form-control">
              <label for="desc-input" class="addstory-form__desc-title"
                >Deskripsi</label
              >
              <div class="addstory-form__title-container">
                <textarea
                  id="desc-input"
                  name="description"
                  aria-required="true"
                  placeholder="Masukkan deskripsi cerita"
                  required
                ></textarea>
              </div>
            </div>

            <div id="camera-container" class="addstory-form__camera-container">
              <video id="camera-video" class="addstory__camera-video">
                Video stream tidak tersedia
              </video>
              <canvas
                id="camera-canvas"
                class="addstory-form__camera-canvas"
              ></canvas>

              <div class="addstory-form__camera-tools">
                <div class="addstory-form__documentation-container">
                  <div class="addstory-form__documentations-buttons">
                    <button
                      id="documentations-input-button"
                      class="btn btn-outline"
                      type="button"
                    >
                      Pilih Gambar
                    </button>
                    <input
                      id="documentations-input"
                      name="documentations"
                      type="file"
                      accept="image/*"
                      hidden="hidden"
                    />
                  </div>

                  <div class="addstory-form__camera-tools-buttons">
                    <button id="camera-take-button" class="btn" type="button">
                      Ambil Gambar
                    </button>
                  </div>
                </div>
              </div>

              <ul
                id="documentations-taken-list"
                class="addstory-form__documentations-outputs"
              ></ul>
            </div>

            <div class="form-control">
              <div class="addstory-form__location-title">Lokasi</div>
              <div class="addstory-form__location-container">
                <div class="addstory-form__location-map-container">
                  <div
                    id="map"
                    class="addstory-form__location-map"
                    style="height: 400px"
                  ></div>
                </div>

                <div class="addstory-form__location-lat-lng">
                  <label for="latitude"></label>
                  <input
                    id="latitude"
                    type="number"
                    name="latitude"
                    value="-6.175389"
                    disabled
                  />
                  <label for="longitude"></label>
                  <input
                    id="longitude"
                    type="number"
                    name="longitude"
                    value="106.827139"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div class="form-buttons">
              <span id="submit-button-container">
                <button class="btn" type="submit">Buat Story</button>
              </span>
              <a class="btn btn-outline" href="#">Batal</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({
      view: this,
      model: StoryAPI,
    });
    this.#setupForm();
    await this.#setupCamera();
    await this.#setupMap();

    window.addEventListener("hashchange", async () => {
      this.#camera?.stop();
    });

    window.addEventListener("visibilitychange", async () => {
      if (document.hidden) {
        this.#camera?.stop();
      } else if (window.location.hash === "/new") {
        this.#camera?.launch();
      }
    });
  }

  #setupForm() {
    this.#form = document.getElementById("addstory-form");

    const inputFile = this.#form.elements.documentations;

    document
      .getElementById("documentations-input-button")
      .addEventListener("click", () => {
        inputFile.click();
      });

    inputFile.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (file) {
        this.#takenPhoto = file;

        await this.#addTakenPicture(file);
        this.#camera?.stop();
        this.#disableInputs();
      }
    });

    const latInput = this.#form.elements.namedItem("latitude");
    const lonInput = this.#form.elements.namedItem("longitude");

    latInput.addEventListener("change", () => {
      this.#hasClickedMap = true;
    });
    lonInput.addEventListener("change", () => {
      this.#hasClickedMap = true;
    });

    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const description = this.#form.elements.namedItem("description").value;
      const photo = inputFile.files[0] || this.#takenPhoto;

      if (!description || !photo) {
        alert("Harap isi kolom deskripsi dan foto!");
        return;
      }

      const data = {
        description,
        photo,
        lat: this.#form.elements.namedItem("latitude").value,
        lon: this.#form.elements.namedItem("longitude").value,
      };
      console.log(data);
      await this.#presenter.postAddStory(data);
      this.#camera?.stop();
    });
  }

  #disableInputs() {
    document.getElementById("camera-take-button").disabled = true;
    document.getElementById("documentations-input").disabled = true;
    document.getElementById("documentations-input-button").disabled = true;
  }

  storeSuccessfully(message) {
    console.log(message);
    this.#camera?.stop();
    this.#form.reset();
    this.#takenPhoto = null;

    location.hash = "/";
  }

  storeFailed(message) {
    alert(message);
  }

  async #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById("camera-video"),
        canvas: document.getElementById("camera-canvas"),
      });
      await this.#camera.launch();
    }

    this.#camera.addCheeseButtonListener("#camera-take-button", async () => {
      const image = await this.#camera.takePicture();
      this.#takenPhoto = image;
      await this.#addTakenPicture(image);
      this.#camera.stop();
      this.#disableInputs();
    });
  }

  async #addTakenPicture(image) {
    let blob = image;

    if (image instanceof String) {
      blob = await convertBase64ToBlob(image, "image/png");
    }

    const url = URL.createObjectURL(blob);
    const list = document.getElementById("documentations-taken-list");
    list.innerHTML = "";
    const listItem = document.createElement("li");
    const img = document.createElement("img");

    img.src = url;
    img.alt = "Hasil Kamera";
    img.style.maxWidth = "100%";

    listItem.appendChild(img);
    list.appendChild(listItem);
  }

  async #setupMap() {
    this.#map = L.map("map").setView([-6.200001, 106.816666], this.#zoom);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    }).addTo(this.#map);

    let selectedMarker = null;
    let latInput = this.#form.elements.namedItem("latitude").value;
    let lonInput = this.#form.elements.namedItem("longitude").value;

    const initialLatLng = [parseFloat(latInput), parseFloat(lonInput)];
    selectedMarker = L.marker(initialLatLng).addTo(this.#map);

    this.#map.on("click", (event) => {
      this.#hasClickedMap = true;
      const { lat, lng } = event.latlng;
      this.#form.elements.namedItem("latitude").value = lat;
      this.#form.elements.namedItem("longitude").value = lng;

      if (selectedMarker) {
        selectedMarker.setLatLng(event.latlng);
        this.#map.flyTo(event.latlng);
      } else {
        selectedMarker = L.marker(event.latlng).addTo(this.#map);
      }
    });
  }
}
