<template>
  <binaryBit></binaryBit>
  <ASCII></ASCII>
</template>

<script>
import binaryBit from './components/binaryBit.vue'
import ASCII from './components/ASCII.vue'

export default {
  name: 'App',
  components: {
    binaryBit,
    ASCII
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
