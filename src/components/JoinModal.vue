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
            <v-text-field
              type="number"
              label="how many"
              v-model="newCount"
              @change="$emit('update:count', parseInt(newCount))"
            ></v-text-field></div
        ></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="$emit('update:show', false)"
            >Disagree</v-btn
          >
          <v-btn color="green darken-1" text @click="agree">Agree</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  props: {
    show: Boolean,
    count: Number,
    venue: Object
  },
  data() {
    return {
      newCount: Number
    };
  },
  methods: {
    agree() {
      const newPresent = parseInt(this.newCount) + this.venue.present;
      if (newPresent <= this.venue.capacity) {
        console.log("It fits! You can enter the venue.");
        const venue = {
          id: this.venue.id,
          present: newPresent
        };
        this.$store.dispatch("updatePresent", venue);
      } else {
        console.log("It doesn't fit do you want to join the waitlist?");
      }
      this.$emit("update:show", false);
    }
  },
  created() {
    this.newCount = this.count;
  }
};
</script>
