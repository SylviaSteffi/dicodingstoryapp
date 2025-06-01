import Database from "../../data/database";
import {
  generateSaveStoryButtonTemplate,
  generateUnsaveStoryButtonTemplate,
} from "../../template";

export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadStories() {
    try {
      const response = await this.#model.getData();
      if (response.ok) {
        this.#view.renderStories(response.listStory);
      } else {
        console.error("loadStories: error status", response);
      }
    } catch (error) {
      console.error("loadStories: caught exception:", error);
    }
  }

  async isStorySaved(id) {
    return await Database.getStoryById(id);
  }

  async toggleSaveStory(story) {
    const isSaved = await this.isStorySaved(story.id);
    if (isSaved) {
      await Database.removeStory(story.id);
      return "save";
    } else {
      await Database.putStory(story);
      return "unsave";
    }
  }

  getSaveButtonTemplate(isSaved) {
    return isSaved
      ? generateUnsaveStoryButtonTemplate()
      : generateSaveStoryButtonTemplate();
  }
}
