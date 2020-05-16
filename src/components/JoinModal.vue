<template>
  <v-row justify="center">
    <v-dialog v-model="show" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Are you healthy?</v-card-title>
        <v-card-text>
          <div>
            By agreeing to this you state that you are healthy and havn't been
            in contact with CORONA
          </div>
          <div>
            <input
              type="number"
              label="how many"
              v-model="newCount"
              @change="$emit('update:count', newCount)"
            /></div
        ></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="$emit('update:show', false)"
            >Disagree</v-btn
          >
          <v-btn
            color="green darken-1"
            text
            @click="$emit('update:show', false)"
            >Agree</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  props: {
    show: Boolean,
    count: Number
  },
  data() {
    return {
      newCount: Number
    };
  },
  created() {
    this.newCount = this.count;
  }
};
</script>
