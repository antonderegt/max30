<template>
  <v-row justify="center">
    <v-dialog v-model="show" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">Bent u gezond?</v-card-title>
        <v-card-text>
          <v-checkbox
            class="ma-0 pa-0"
            v-model="declaration1"
            label="Ervaart u en gezelschap momenteel of in de afgelopen twee weken
            klachten?"
          ></v-checkbox>
          <v-checkbox
            class="ma-0 pa-0"
            v-model="declaration2"
            label="Ervaart u en gezelschap thuis momenteel of in de afgelopen twee
            weken klachten?"
          ></v-checkbox>
          <v-checkbox
            class="ma-0 pa-0"
            v-model="declaration3"
            label="Bent u elders in contact gekomen met individuen die klachten
            hebben/vertonen?"
          ></v-checkbox>
          <v-checkbox
            class="ma-0 pa-0"
            v-model="declaration4"
            label="Verklaart u en gezelschap naar eigen weten gezond
            te zijn?"
          ></v-checkbox>
          <v-text-field
            type="number"
            label="Hoeveel personen?"
            v-model="newCount"
            @change="$emit('update:count', parseInt(newCount))"
          ></v-text-field>
        </v-card-text>
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
      newCount: Number,
      declaration1: false,
      declaration2: false,
      declaration3: false,
      declaration4: false
    };
  },
  methods: {
    async agree() {
      if (
        !this.declaration1 ||
        !this.declaration2 ||
        !this.declaration3 ||
        !this.declaration4
      ) {
        this.$store.dispatch("setSnackbar", {
          show: true,
          text: "U moet alles accepteren om verder te gaan"
        });
        return;
      }
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
      this.$emit("update:show", false);
    }
  },
  created() {
    this.newCount = this.count;
  }
};
</script>
