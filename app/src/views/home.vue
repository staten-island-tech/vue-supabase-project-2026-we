<template>
  <div>
  <div class="lvlcontain">
    <h1>Song Selector</h1>
    <RouterLink to="/level1">
      <div>
        <h1>Song Name 1</h1>
        <h2>Artist Name</h2>
        <p>Easy</p>
      </div>
    </RouterLink>
    <RouterLink to="/level2">
      <button>Level 2</button>
    </RouterLink>
    <RouterLink to="/level3">
      <button>Level 3</button>
    </RouterLink>
  </div>
  </div>
</template>

<script setup>
// home will be the load screen :)
// buttons that lead to different levels
// level1.vue, level2.vue, level3.vue
// code
//Get the timing on all the levels
//Make the function for the user to time it
//If > the timing, DIEEE
//If = the timing or has 0.1 second offset, move on and reset it :D


</script>

<style scoped>
body {
  background-color: rgb(156, 219, 255);
}

.lvlcontain {
  position: absolute;
  top: 10%;
  left: 10%;
  color: white;
  width: 15%;
  height: auto;
  background-color: rgb(255, 115, 115);
  display: flex;
  flex-direction: column; 
  align-items: center; 
  gap: 10px; 
  padding-bottom: 20px;
  border-radius: 20px;
}

.levelcard {
  background-color: rgb(120, 228, 255);
  width: 200px;
  height: 200px;
  text-align: center;
  font-size: 35px;
  border-radius: 20px;
}
</style>