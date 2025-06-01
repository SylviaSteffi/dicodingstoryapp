export default class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async postAddStory({ description, photo, lat, lon }) {
    try {
      const data = {
        description: description,
        photo: photo,
        lat: lat,
        lon: lon,
      };
      const response = await this.#model.addNewStory(data);

      if (!response.ok) {
        console.error("postAddStory: response:", response);
        this.#view.storeFailed(response.message);
        return;
      }

      this.#view.storeSuccessfully(response.message, response.data);
    } catch (error) {
      console.error("postAddStory: error:", error);
      this.#view.storeFailed(error.message);
    }
  }
}
