import * as StoryAPI from "../../data/api";
import HomePresenter from "./home-presenter";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import L from "leaflet";

export default class HomePage {
  #presenter = null;
  #zoom = 5;
  #map = null;

  async render() {
    return `
      <section class="container">
        <h1 id="home-title">Beranda</h1>
        <div id="story-list" class="story-list"></div>
        <div id="map" style="height:400px;"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
    });
    await this.#presenter.loadStories();
  }

  async renderStories(stories) {
    const storyListContainer = document.getElementById("story-list");
    storyListContainer.innerHTML = "";

    if (!stories.length) {
      storyListContainer.innerHTML =
        "<p>Tidak ada cerita untuk ditampilkan.</p>";
      return;
    }

    stories.forEach(async (story) => {
      const storyItem = document.createElement("div");
      storyItem.classList.add("story-item");

      const isSaved = await this.#presenter.isStorySaved(story.id);
      const saveButtonHTML = this.#presenter.getSaveButtonTemplate(isSaved);

      storyItem.innerHTML = `
        <h2>${story.name}</h2>
        <img src="${story.photoUrl}" alt="${story.name}" />
        <p>${story.description}</p>
        <p>Dibuat pada ${new Date(story.createdAt).toLocaleDateString()}</p>
        <div class="save-actions-container" data-id="${
          story.id
        }">${saveButtonHTML}</div>
      `;
      storyListContainer.appendChild(storyItem);

      const container = document.querySelector(
        `.save-actions-container[data-id="${story.id}"]`,
      );
      if (!container) return;

      const renderButton = async () => {
        const isSaved = await this.#presenter.isStorySaved(story.id);
        container.innerHTML = this.#presenter.getSaveButtonTemplate(isSaved);

        const button = container.querySelector("button");
        if (button) {
          button.addEventListener("click", async () => {
            await this.#presenter.toggleSaveStory(story);
            await renderButton();
          });
        }
      };

      renderButton();
    });

    this.initMap(stories);
  }

  initMap(stories) {
    this.#map = L.map("map").setView([-6.200001, 106.816666], this.#zoom);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    }).addTo(this.#map);

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.#map);
        marker
          .bindPopup(`<b>${story.name}</b><br>${story.description}`)
          .openPopup();
      }
    });
  }
}
