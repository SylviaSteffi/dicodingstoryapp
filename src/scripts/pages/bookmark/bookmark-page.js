import BookmarkPresenter from "./bookmark-presenter";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import L from "leaflet";

export default class BookmarkPage {
  #presenter = null;
  #zoom = 5;
  #map = null;

  async render() {
    return `
      <section class="container">
        <h1 id="bookmark-title">Daftar Story Tersimpan</h1>
        <div id="story-list" class="story-list"></div>
        <div id="map" style="height: 400px;"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
    });

    await this.#presenter.loadSavedStories();
  }

  async renderBookmarkedStories(stories) {
    const storyListContainer = document.getElementById("story-list");
    storyListContainer.innerHTML = "";

    if (!stories.length) {
      storyListContainer.innerHTML =
        "<p>Tidak ada story tersimpan untuk ditampilkan.</p>";
      return;
    }

    stories.forEach((story) => {
      const storyItem = document.createElement("div");
      storyItem.classList.add("story-item");

      storyItem.innerHTML = `
        <h2>${story.name}</h2>
        <img src="${story.photoUrl}" alt="${story.name}" />
        <p>${story.description}</p>
        <p>Dibuat pada ${new Date(story.createdAt).toLocaleDateString()}</p>
        <button class="delete-button" data-id="${story.id}">
          Hapus story
        </button>
      `;

      storyItem
        .querySelector(".delete-button")
        .addEventListener("click", async () => {
          const confirmed = confirm("Yakin ingin menghapus story ini?");
          if (confirmed) {
            await this.#presenter.deleteStoryById(story.id);
          }
        });

      storyListContainer.appendChild(storyItem);
    });

    this.initMap(stories);
  }

  initMap(stories) {
    if (this.#map) {
      this.#map.remove();
    }

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
