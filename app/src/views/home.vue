<template>
  <div>
  <div class="lvlcontain">
    <h1>Song Selector</h1>
    <RouterLink to="/level1">
    <div class="levelcard">

      <div class="text">
        <h2>Song Name</h2>
        <p>Artist Name</p>
        <p>Easy</p>
      </div>
    </div>
    </RouterLink>
    <RouterLink to="/level2">
      <div class="levelcard">
      </div>
    </RouterLink>
    <RouterLink to="/level3">
      <div class="levelcard">
      </div>
    </RouterLink>
    <RouterLink to="/level4">
      <div class="levelcard">
      </div>
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

.lvlcontain {
  position: absolute;
  top: 10%;
  left: 10%;
  color: white;
  width: 20%;
  height: 75%;
  background-color: #920075;
  display: flex;
  flex-direction: column; 
  align-items: center; 
  gap: 10px; 
  padding-bottom: 20px;
  border-radius: 20px;
}

.levelcard {
  display: flex;
  align-items: center;
  gap: 15px;

  background-color: #F6019D;
  width: 325px;
  height: 145px;
  border-radius: 20px;

  padding: 15px;
  box-sizing: border-box;
}

.levelcard img {
  width: 90px;
  height: 90px;
  border-radius: 15px;
  object-fit: cover;
}

.text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.text h2 {
  margin: 0;
  font-size: 18px;
}

.text p {
  margin: 2px 0;
  font-size: 14px;
  opacity: 0.8;
}
</style>