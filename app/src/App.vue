<template>
  <!-- App.vue is the root component. RouterView displays the current page. -->
  <div>
    <RouterView />
  </div>
</template>

<!-- No component script is needed here; this file only hosts the router view. -->

<style>
/* Global styles for the app. Keep these simple for beginners. */
* {
  font-family: 'inter';
}

body {
  /* Background image that fills the screen. */
  background-image: url('/background.png');
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
