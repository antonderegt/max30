<template>
  <Loading v-if="loadingVenue" />
  <v-container v-else>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card max-width="400" class="mx-auto">
          <v-row v-if="venue === null">
            <v-col>
              <h3>No venue information...</h3>
            </v-col>
          </v-row>

          <v-row v-else class="pa-3" no-gutters>
            <!-- TODO: how to higlight the edited fields and blur the info fields of the venu (perhabs dismiss during edit -->
            <v-col v-if="isEdit && editedVenue" cols="11">
              <!-- Venue info fields -->
              <v-text-field
                label="Naam"
                v-model="editedVenue.name"
                :value="editedVenue.name"
              ></v-text-field>
              <v-text-field
                label="Stad"
                v-model="editedVenue.location.city"
                :value="editedVenue.location.city"
              ></v-text-field>
              <v-text-field
                label="Adres"
                v-model="editedVenue.location.address"
                :value="editedVenue.location.address"
              ></v-text-field>

              <!-- Venue capacity -->
              <v-row v-show="isAdmin" class="pa-3" justify="center" no-gutters>
                <v-col>
                  Pas capaciteit aan:
                </v-col>
              </v-row>

              <v-row v-show="isAdmin">
                <v-col align="center">
                  <v-btn
                    color="error"
                    @click="updateMetaInfo('capacity', venue.capacity - 1)"
                    >-</v-btn
                  >
                </v-col>
                <v-col align="center">
                  <v-btn
                    color="success"
                    @click="updateMetaInfo('capacity', venue.capacity + 1)"
                    >+</v-btn
                  >
                </v-col>
              </v-row>
            </v-col>
            <v-col v-else cols="11">
              <v-card-title>{{ venue.name }}</v-card-title>
              <v-card-subtitle v-if="venue.location">
                {{ venue.location.city }}, {{ venue.location.address }}
              </v-card-subtitle>
            </v-col>
            <v-col v-show="isAdmin" @click="isEdit = !isEdit" cols="1 pt-4">
              <v-icon>create</v-icon>
            </v-col>
          </v-row>
          <v-divider></v-divider>

          <v-row no-gutters>
            <v-col cols="6">
              <v-card-text>Capaciteit: {{ venue.capacity }}</v-card-text>
            </v-col>

            <v-col cols="6">
              <v-card-text>Aanwezig: {{ venue.present }}</v-card-text>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col class="ma-3">
              <v-progress-linear xs12 v-model="progress" height="25" reactive>
                <strong>{{ venue.present }} / {{ venue.capacity }}</strong>
              </v-progress-linear>
            </v-col>
          </v-row>

          <v-row v-show="isAdmin" class="pa-3" justify="center" no-gutters>
            <v-col>
              Pas aanwezigen aan:
            </v-col>
          </v-row>

          <v-row v-show="isAdmin">
            <v-col align="center">
              <v-btn
                color="error"
                @click="updateMetaInfo('present', venue.present - 1)"
                >-</v-btn
              >
            </v-col>
            <v-col align="center">
              <v-btn
                color="success"
                @click="updateMetaInfo('present', venue.present + 1)"
                >+</v-btn
              >
            </v-col>
          </v-row>
          <v-col v-if="isAdmin" align="center">
            <VueQrcode
              :value="`https://plekkie.me/venue/${venue.id}`"
              :options="{ width: 200 }"
            />
          </v-col>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!isAdmin">
      <v-col v-if="waitList.length === 0" xs12>
        <v-card-text>Geen wachtrij, kom snel!</v-card-text>
      </v-col>

      <v-col xs12 class="pa-3">
        <v-btn outlined block @click="show = !show">Reserveer</v-btn>
        <JoinModal
          v-if="show"
          :show.sync="show"
          :count.sync="count"
          :venue="venue"
          :user="user"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-row v-if="waitList.length" xs12>
          <v-col>
            Wachtrij:
          </v-col>
        </v-row>
        <div v-if="!isAdmin">
          <v-row v-for="person in waitList" :key="person.id">
            <v-col>
              {{ person.name }}
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <Loading v-if="loadingWaitList" />

    <v-row v-if="isAdmin" class="pa-3" justify="center">
      <v-col cols="12" md="3" v-for="person in waitList" :key="person.id">
        <v-card>
          <v-card-title>
            {{ person.name }}
          </v-card-title>
          <v-card-text> With {{ person.count }} people. </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              color="success"
              @click="acceptOrDeclineGroup(person.id, person.count, 'accepted')"
            >
              accept
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              @click="acceptOrDeclineGroup(person.id, person.count, 'declined')"
              >decline</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
import JoinModal from "@/components/JoinModal.vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";

export default {
  props: ["isAdmin"],
  computed: {
    progress() {
      return (this.venue.present / this.venue.capacity) * 100;
    },
    ...mapState(["venue", "waitList", "user"])
  },
  data() {
    return {
      venueID: "",
      loadingVenue: false,
      loadingWaitList: false,
      show: false,
      count: 1,
      isEdit: false,
      editedVenue: null
    };
  },
  watch: {
    venue(newValue) {
      this.editedVenue = newValue; // prefill edit fields
    },
    editedVenue: {
      async handler(newValue) {
        await this.$store.dispatch("updateVenue", newValue);
      },
      deep: true
    }
  },
  methods: {
    async getVenue() {
      this.loadingVenue = true;
      try {
        await this.$store.dispatch("bindVenue", this.venueID);
        this.loadingVenue = false;
        this.loadingWaitList = true;
        await this.$store.dispatch("bindWaitList", this.venueID);
        this.loadingWaitList = false;
      } catch (error) {
        alert("bindVenue: " + error);
      }
    },
    async acceptOrDeclineGroup(userID, count, status) {
      let newCount = this.venue.present;

      if (status == "accepted") {
        newCount += parseInt(count);
      }

      try {
        await this.updatePresent(newCount);
        const waitList = {
          venue: this.venue.id,
          user: userID,
          status
        };
        await this.$store.dispatch("updateWaitList", waitList);
      } catch (error) {
        alert(error);
      }
    },
    async updateMetaInfo(property, newValue) {
      newValue = newValue < 0 ? 0 : newValue; // prevent new value from goging negative

      switch (property) {
        case "present":
          this.editedVenue.present = newValue;
          break;
        case "capacity":
          this.editedVenue.capacity = newValue;
      }

      try {
        await this.$store.dispatch("updateVenue", this.editedVenue);
      } catch (error) {
        console.log(error);
      }
    }
  },
  components: {
    Loading,
    JoinModal,
    VueQrcode
  },
  created() {
    this.venueID = this.$route.params.venue;
    this.getVenue();
  }
};
</script>
