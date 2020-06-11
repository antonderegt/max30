<template>
  <v-row justify="center">
    <v-dialog v-model="show" persistent max-width="380">
      <v-card>
        <v-card-title class="headline">Hoeveel personen?</v-card-title><br />
        <v-card-text> </v-card-text>
        <v-slider v-model="newCount" thumb-label="always" max="30">
          <template v-slot:prepend>
            <v-icon @click="newCount--">
              mdi-minus
            </v-icon>
          </template>

          <template v-slot:append>
            <v-icon @click="newCount++">
              mdi-plus
            </v-icon>
          </template>
        </v-slider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="$emit('update:show', false)"
          >
            Cancel
          </v-btn>
          <v-btn color="green darken-1" text @click="agree">Accepteren</v-btn>
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
    venue: Object,
    user: Object
  },
  data() {
    return {
      newCount: Number
    };
  },
  methods: {
    async agree() {
      // $emit("update:count", parseInt(newCount)); //TODO: ask anton why count is synced?
      const waitListItem = {
        userID: this.user.data.uid,
        venueID: this.venue.id,
        personCount: parseInt(this.newCount),
        status: "waiting"
      };

      const alreadyInQueue = await this.$store.dispatch(
        "checkIfUserAlreadyInQueue",
        waitListItem
      );

      if (alreadyInQueue) {
        this.$store.dispatch("setSnackbar", {
          show: true,
          text: "Mislukt: U staat al in een wachtrij..."
        });
      } else {
        await this.$store.dispatch("joinWaitList", waitListItem);
      }
      this.$router.push("/waiting-room");
    }
  },
  created() {
    this.newCount = this.count;
  }
};
</script>
