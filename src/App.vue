<template>
  <div class="app">
    <Editor v-model="state" :formData="formData" />
  </div>
</template>

<script>
import data from "./data.json";
import { ref, provide } from "vue";
import Editor from "./packages/editor/editor.jsx";
import { registerConfig as config } from "./utils/editor-config.jsx";
import Range from "./components/Range.jsx";

export default {
  components: {
    Editor,
    Range,
  },
  setup() {
    const state = ref(data);
    provide("config", config);
    //提供input双向绑定使用
    const formData = ref({
      username: "monica",
      password: 123456,
      start: 0,
      end: 100,
      href: "https://www.baidu.com/",
    });
    return {
      state,
      formData,
    };
  },
};
</script>

<style lang="scss">
.app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
