<template>
  <v-container>
    <v-progress-linear
      :active="active"
      :background-opacity="opacity"
      :bottom="bottom"
      :buffer-value="buffer"
      :height="height"
      :indeterminate="indeterminate"
      :query="query"
      :rounded="rounded"
      :stream="stream"
      :striped="striped"
      :top="top"
      :value="value"
      color="accent"
    ></v-progress-linear>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    absolute: false,
    active: true,
    opacity: 0.3,
    bottom: false,
    buffer: 100,
    fixed: false,
    height: 4,
    indeterminate: true,
    query: false,
    rounded: false,
    stream: false,
    striped: false,
    top: false,
    value: 25
  })
};
</script>
