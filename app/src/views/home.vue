<template>
  <div class="lvlcontain">
    <h1>Level Selector</h1>
    <button>Level 1</button>
    <button>Level 2</button>
    <button>Level 3</button>
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

.lvlcontain {
  color: white;
  width: 20%;
  height: 20%;
  background-color: gray;
  justify-content: center;
}
button {
  background-color: rgb(120, 228, 255);
  width: 200px;
  height: 200px;
  text-align: center;
  font-size: 35px;
}
</style>