import Database from "../../data/database";

export default class BookmarkPresenter {
  #view;

  constructor({ view }) {
    this.#view = view;
  }

  async loadSavedStories() {
    try {
      const savedStories = await Database.getAllStorys();
      this.#view.renderBookmarkedStories(savedStories);
    } catch (error) {
      console.error("BookmarkPresenter: Gagal memuat data tersimpan", error);
    }
  }

  async deleteStoryById(id) {
    try {
      await Database.removeStory(id);
      await this.loadSavedStories();
    } catch (error) {
      console.error("BookmarkPresenter: Gagal menghapus story", error);
    }
  }
}
