<template>
  <v-row no-gutters>
    <v-dialog v-model="showDialog" max-width="380">
      <v-card v-if="current != -1">
        <v-time-picker
          v-if="openOrClose == 0"
          v-model="hours[current].openTime"
          full-width
          @click:minute="saveTime"
          format="24hr"
        >
          {{ hours[current].label }} open
        </v-time-picker>
        <v-time-picker
          v-else
          v-model="hours[current].closeTime"
          full-width
          @click:minute="saveTime"
          format="24hr"
        >
          {{ hours[current].label }} sluit
        </v-time-picker>
      </v-card>
    </v-dialog>

    <v-container
      class="mx-0 pa-0"
      v-for="(hour, index) in hours"
      :key="hour.label"
      no-gutters
    >
      <v-row no-gutters>
        <v-col cols="12">
          <v-switch
            v-model="hour.open"
            :label="
              hour.open == true
                ? `${hour.label} open`
                : `${hour.label} gesloten`
            "
            @change="toggleClosed(index)"
          ></v-switch>
        </v-col>
      </v-row>
      <v-row no-gutters v-if="hour.open">
        <v-col cols="5">
          <v-text-field
            v-model="hour.openTime"
            :label="hour.label + ' open'"
            prepend-icon="access_time"
            readonly
            @click="togglePicker(index, 0)"
          ></v-text-field>
        </v-col>
        <v-col cols="5">
          <v-text-field
            v-model="hour.closeTime"
            :label="hour.label + ' sluit'"
            prepend-icon="access_time"
            readonly
            @click="togglePicker(index, 1)"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>
  </v-row>
</template>

<script>
export default {
  props: {
    openingHours: Object
  },
  data() {
    return {
      time: null,
      showMenu: false,
      showDialog: false,
      hours: [
        { label: "Maandag", open: false, openTime: null, closeTime: null },
        { label: "Dinsdag", open: false, openTime: null, closeTime: null },
        { label: "Woensdag", open: false, openTime: null, closeTime: null },
        { label: "Donderdag", open: false, openTime: null, closeTime: null },
        { label: "Vrijdag", open: false, openTime: null, closeTime: null },
        { label: "Zaterdag", open: false, openTime: null, closeTime: null },
        { label: "Zondag", open: false, openTime: null, closeTime: null }
      ],
      showPickerSingle: false,
      current: -1,
      openOrClose: 0
    };
  },
  methods: {
    togglePicker(index, openOrClose) {
      this.openOrClose = openOrClose;

      this.current = index;
      this.showDialog = true;
    },
    toggleClosed(index) {
      if (this.hours[index].closed) {
        this.hours[index].openTime = null;
        this.hours[index].closeTime = null;
      }
      this.$emit("update:openingHours", this.hours);
    },
    saveTime() {
      this.current = -1;
      this.showDialog = false;
      this.$emit("update:openingHours", this.hours);
    }
  },
  created() {
    if (this.openingHours == undefined) return;
    this.hours = this.openingHours;
  }
};
</script>
