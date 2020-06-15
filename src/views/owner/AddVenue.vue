<template>
  <Loading v-if="loading" />
  <v-container v-else>
    <v-card width="400" class="mx-auto mt-5">
      <v-card-title>
        <h1 class="display-1">Nieuwe plek</h1>
      </v-card-title>
      <v-card-text>
        <AddVenueForm ref="addVenueComponent" :allFields="true" />
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" class="dark--text" @click="addVenue"
          >Toevoegen</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import AddVenueForm from "@/components/AddVenueForm.vue";
import Loading from "@/components/Loading.vue";

export default {
  data() {
    return { loading: false };
  },
  methods: {
    addVenue() {
      this.loading = true;
      this.$refs.addVenueComponent.addVenue();
    }
  },
  components: { AddVenueForm, Loading }
};
</script>
