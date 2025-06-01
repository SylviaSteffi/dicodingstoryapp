export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
    `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="home-button" class="home-button" href="#/">Beranda <i class="fas fa-home"></i></a></li>
    <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark">Laporan Tersimpan <i class="fas fa-bookmark"></i></a></li>
    <li><a id="new-story-button" class="new-story-button" href="#/new">Buat Story <i class="fas fa-plus"></i></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout">Logout <i class="fas fa-sign-out-alt"></i></a></li>
    `;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateSaveStoryButtonTemplate() {
  return `
    <button id="save-button" class="btn btn-transparent">
      Simpan story <i class="far fa-bookmark"></i>
    </button>
  `;
}

export function generateUnsaveStoryButtonTemplate() {
  return `
    <button id="unsave-button" class="btn btn-transparent">
      Hapus story <i class="fas fa-bookmark"></i>
    </button>
  `;
}
