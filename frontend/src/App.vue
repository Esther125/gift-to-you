<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const isDarkTheme = ref(false);
const icon = ref()

const themeChangeHandler = (event) => {
  isDarkTheme.value = event.matches;
};

const iconChange = (isDarkTheme) => {
  if (isDarkTheme) {
    icon.value = "../src/assets/images/logo/icon_light.png";
  } else {
    icon.value = "../src/assets/images/logo/icon_dark.png";
  }
}

watch(isDarkTheme, iconChange);

onMounted(() => {
  // check theme
  isDarkTheme.value = window.matchMedia("(prefers-color-scheme: dark").matches;
  // add event listener
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', themeChangeHandler);
  // init icon
  iconChange(isDarkTheme.value);
});

onBeforeUnmount(() => {
  // remove event listener
  window.matchMedia("(prefers-color-scheme: dark)").removeEventListener('change', themeChangeHandler);
});

</script>

<template>
    <nav class="navbar navbar-expand-md fixed-top">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">
          <img :src= "icon" width="30" height="24" class="d-inline-block align-text-top">
          CloudDrop
        </a>
        <div class="d-flex justify-content-end align-items-center">
          <RouterLink to="/" class="link">
            <i class="bi bi-people-fill h3 icon"></i>
          </RouterLink>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" aria-expanded="false" data-bs-toggle="dropdown">
              <i class="bi bi-person-lines-fill h3 icon"></i>
            </a>
            <ul 
              :class="['dropdown-menu', { 'dropdown-menu-dark': isDarkTheme }]"
              aria-labelledby="navbarDropdown"
              style="position: absolute; top: 100%; left: auto; right: 0;">
              <li>
                <RouterLink to="/about" class="dropdown-item">
                  <i class="bi bi-collection-fill h5 icon"></i> Temporary Storage
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/history" class="dropdown-item">
                  <i class="bi bi-clock-history h5 icon" ></i> History
                </RouterLink>
              </li>
            </ul>
          </li>
        </div>
      </div>
    </nav>

  <RouterView />
</template>

<style scoped>
.navbar {
  background-color: var(--color-background-mute);
}

.navbar-brand:hover, .icon:hover, .link:hover {
  background-color: var(--color-background-soft)
}

.icon {
    color: var(--color-text);
}

.link {
  margin: 0px 10px;
}

.dropdown .ul .li{
  background-color: var(--color-background-mute);
  color: var(--color-text);
}

.dropdown-item .icon {
  margin-right: 5px;
}

.navbar-brand {
    color: var(--color-text);
}

.dropdown:hover .dropdown-menu {
    display: block;
    margin-top: 0;
}

.dropdown-toggle::after {
  display: none !important;
}

li {
  list-style-type: none;
}
</style>
