<template>
  <div class="dodaNotice">
  </div>
</template>
<script>
export default {
  name: 'dodaNotice',
  props: {
    commentsLength: Number,
    memberListLength: Number
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.red {
  color: red;
  font-weight: bold;
}
.green {
  color: green;
  font-weight: bold;
}
.ft8 {
  font-size: 13px;
}
table {
  margin: auto;
}
input[type=checkbox] {
  zoom: 2.5;
}
.bold {
  font-weight: bold;
}
hr {
    border: 0;
    height: 1px;
    background: lightblue;
}
.ml-5 {
  margin-left: 5px;
}
.mr-5 {
  margin-right: 5px;
}
@media (min-width: 200px) and (max-width: 869px) {
  .mob-mb-20 {
    margin-bottom: 20px;
  }
}
</style>
