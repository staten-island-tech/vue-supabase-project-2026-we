<template>
  <div>
  <div class="lvlcontain">
    <h1>Song Selector</h1>
      <div 
        class="levelcard" 
        v-for="level in levels" 
        :key="level.name"
        @click="selectLevel(level)"
      >
        <img :src="level.img">
        <div class="text">
          <h2>{{ level.name }}</h2>
          <p>{{ level.desc }}</p>
          <p>Difficulty: {{ level.difficulty }}</p>
        </div>
      </div>
  </div>
  <div class="playcard" v-if="selectedLevel">
  <p class="level">LEVEL</p>
  <h1>{{ selectedLevel.name }}</h1>

  <div class="difficulty">
    <span class="easy">✦ {{ selectedLevel.difficulty.toUpperCase() }}</span>
    <span class="score">{{ selectedLevel.points }} POINTS</span>
  </div>

   <RouterLink :to="selectedLevel.link"><button class="playbtn">
    ▶ PLAY
    <p>START SESSION</p>
  </button></RouterLink>
  </div>
  <div class="leaderboard">
    <h2>LEADERBOARD</h2>
    <div class="scoreline">
      <span>Player One</span>
      <span>1000</span>
    </div>
    <div class="scoreline">
      <span>Player Two</span>
      <span>100</span>
    </div>
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

import { ref } from 'vue'

const selectedLevel = ref(null)

const levels = [
  {
    name: 'fortnite',
    desc: 'guy from fortnite',
    difficulty: 'Easy',
    points: 1000,
    img: '/quandale.png',
    link: '/level1'
  },
  {
    name: 'trickshot',
    desc: 'guy with hat',
    difficulty: 'Medium',
    points: 2000,
    img: '/lincoln.png',
    link: '/level2'
  },
    {
    name: 'sheep',
    desc: 'baaaa',
    difficulty: 'Hard',
    points: 3000,
    img: '/quandale.png',
    link: '/level3'
  },
    {
    name: 'ghost',
    desc: 'booooo',
    difficulty: 'Nightmare',
    points: 4000,
    img: '/quandale.png',
    link: '/level4'
  },
]

function selectLevel(level) {
  selectedLevel.value = level
}

</script>

<style scoped>

.lvlcontain {
  position: absolute;
  top: 15%;
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
  gap: 20px;

  background-color: #F6019D;
  width: 325px;
  height: 145px;
  border-radius: 20px;

  padding: 15px;
  box-sizing: border-box;
  cursor: pointer;
}

.levelcard:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.levelcard img {
  width: 90px;
  height: 90px;
  border-radius: 15px;
  object-fit: cover;
  margin-left: 10px;
}

.text {
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.text h2 {
  margin: 0;
  font-size: 25px;
}
.text p {
  margin: 2px 0;
  font-size: 16px;
  opacity: 0.8;
}
a {
  text-decoration: none;
  color: inherit;
}
a:visited {
  text-decoration: none;
  color: inherit;
}

.playcard {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #D40078;
  padding: 30px;
  border-radius: 20px;
  color: white;
  width: 400px;
}
.playcard .level {
  opacity: 0.7;
  margin: 0;
}
.playcard h1 {
  margin: 5px 0 20px 0;
  font-size: 40px;
}
.difficulty {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.playbtn {
  width: 100%;
  padding: 20px;
  border-radius: 15px;
  border: none;
  font-size: 22px;
  background: #F6019D;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}
.playbtn:hover {
  background: rgba(255,255,255,0.25);
}
.playbtn p {
  font-size: 12px;
  margin: 5px 0 0 0;
  opacity: 0.7;
}


.leaderboard {
  position: absolute;
  top: 30%;
  right: 10%;
  background: rgb(255, 78, 196);
  padding: 20px;
  border-radius: 20px;
  color: white;
  width: 350px;
}
.leaderboard h2 {
  margin-bottom: 20px;
}
.scoreline {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 18px;
}
</style>