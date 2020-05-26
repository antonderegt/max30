<template>
  <v-row justify="center">
    <v-dialog v-model="showReportModal" persistent max-width="400">
      <v-card>
        <v-card-title class="headline"
          >Wil je deze zaak rapporteren?</v-card-title
        >
        <v-card-text>
          <div>
            <v-text-field
              label="Reden voor rapporteren"
              v-model="reason"
            ></v-text-field></div
        ></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="$emit('update:showReportModal', false)"
            >Cancel</v-btn
          >
          <v-btn color="green darken-1" text @click="reportVenue"
            >Rapporteer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { db, Timestamp } from "@/db";

export default {
  props: {
    showReportModal: Boolean,
    venueID: String
  },
  data() {
    return {
      reason: ""
    };
  },
  methods: {
    async reportVenue() {
      const timestamp = Timestamp.fromDate(new Date());
      await db.collection("reports").add({
        venueID: this.venueID,
        reason: this.reason,
        timestamp
      });
      this.$store.dispatch("setSnackbar", {
        show: true,
        text: "Bedankt voor het rapporteren!"
      });
      this.$emit("update:showReportModal", false);
    }
  },
  created() {}
};
</script>
