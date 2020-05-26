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

              <v-divider></v-divider>

              <!-- Venue capacity -->
              <v-row v-show="isAdmin" class="pa-3" justify="center" no-gutters>
                <v-col>
                  Pas capaciteit aan. Huidig: <b>{{ venue.capacity }}</b>
                </v-col>
              </v-row>

              <v-row v-show="isAdmin">
                <v-col align="center">
                  <v-btn
                    color="warning"
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
              <v-divider></v-divider>

              <v-row
                v-show="isAdmin"
                class="pa-3 mt-10"
                justify="center"
                no-gutters
              >
                <v-col>
                  <v-btn color="error" @click="deleteVenue()"
                    >Verwijder bedrijf uit Plekkie</v-btn
                  >
                </v-col>
              </v-row>
            </v-col>

            <v-col v-else cols="11">
              <v-card-title
                >{{ venue.name
                }}<v-btn
                  v-if="!isAdmin"
                  @click="showReportModal = !showReportModal"
                  text
                  icon
                  color="red lighten-2"
                >
                  <v-icon>mdi-alert-circle-outline</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-subtitle v-if="venue.location">
                {{ venue.location.city }}, {{ venue.location.address }}
              </v-card-subtitle>
              <ShareNetwork
                class="mx-4"
                network="WhatsApp"
                :url="'https://plekkie.me/venue/' + venue.id"
                :title="venue.name"
                :description="
                  'Is er nog plek bij ' +
                    venue.name +
                    '? Op Plekkie.me is altijd te zien waar er nog plek is! Is er geen plek meer bij ' +
                    venue.name +
                    ', kijk dan op onze site om andere locaties te checken'
                "
              >
                <v-btn color="success" class="white--text">
                  <v-icon>fab fa-whatsapp</v-icon>
                </v-btn>
              </ShareNetwork>
              <ShareNetwork
                class="mx-4"
                network="Facebook"
                :url="'https://plekkie.me/venue/' + venue.id"
                :title="venue.name"
                :description="
                  'Is er nog plek bij ' +
                    venue.name +
                    '? Op Plekkie.me is altijd te zien waar er nog plek is! Is er geen plek meer bij ' +
                    venue.name +
                    ', kijk dan op onze site om andere locaties te checken'
                "
                quote="Plekkie houdt mijn alcoholisme in stand. - Kroeg Tijger"
                hashtags="feest,wachtrij,reserveren,plekkie"
              >
                <v-btn color="info" class="white--text">
                  <v-icon>fab fa-facebook-f</v-icon>
                </v-btn>
              </ShareNetwork>
            </v-col>
            <v-col v-show="isAdmin" @click="toggleEdit()" cols="1 pt-4">
              <v-icon>{{ isEdit ? "done" : "create" }}</v-icon>
            </v-col>
          </v-row>
          <v-divider></v-divider>

          <div class="venueInfo" v-if="!isEdit">
            <v-row no-gutters>
              <v-col cols="6">
                <v-card-text>Capaciteit: {{ venue.capacity }}</v-card-text>
              </v-col>

              <v-col cols="6">
                <v-card-text>Aanwezig: {{ venue.presentCount }}</v-card-text>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col class="ma-3">
                <v-progress-linear
                  cols="12"
                  v-model="progress"
                  height="25"
                  reactive
                >
                  <strong
                    >{{ venue.presentCount }} / {{ venue.capacity }}</strong
                  >
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
                  color="warning"
                  @click="
                    updateMetaInfo('presentCount', venue.presentCount - 1)
                  "
                  >-</v-btn
                >
              </v-col>
              <v-col align="center">
                <v-btn
                  color="success"
                  @click="
                    updateMetaInfo('presentCount', venue.presentCount + 1)
                  "
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
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!isAdmin">
      <v-col v-if="waitList.length === 0" cols="12">
        <v-card-text>Geen wachtrij, kom snel!</v-card-text>
      </v-col>

      <v-col cols="12" class="pa-3">
        <v-btn outlined block @click="checkUser(venue.id)"
          >Stap in de rij</v-btn
        >
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
        <v-row v-if="waitList.length">
          <v-col>
            Wachtrij:
          </v-col>
        </v-row>
        <div v-if="!isAdmin">
          <v-row v-for="person in waitList" :key="person.id">
            <v-col> Groep van: {{ person.personCount }} </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <Loading v-if="loadingWaitList" />

    <v-row v-if="isAdmin" class="pa-3" justify="center">
      <v-col
        cols="12"
        md="6"
        v-for="(person, index) in waitList"
        :key="person.userID"
      >
        <v-card>
          <v-card-title>
            <!-- TODO get name instead of userID -->
            {{ person.userID }}
          </v-card-title>
          <v-card-text> With {{ person.personCount }} people. </v-card-text>
          <chatCard
            v-if="openChat == index"
            :userID="person.userID"
            :venueID="venueID"
            sender="owner"
          />
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              color="success"
              @click="
                acceptOrDeclineGroup(
                  index,
                  person.userID,
                  person.personCount,
                  'accepted'
                )
              "
            >
              yes
            </v-btn>
            <v-btn v-if="openChat != index" @click="openChat = index"
              >Chat</v-btn
            >
            <v-btn v-if="openChat == index" @click="openChat = -1"
              >Close Chat</v-btn
            >
            <v-btn
              color="error"
              @click="
                acceptOrDeclineGroup(
                  index,
                  person.userID,
                  person.personCount,
                  'declined'
                )
              "
              >no</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <ReportModal
      v-if="showReportModal"
      :venueID="venue.id"
      :showReportModal.sync="showReportModal"
    />
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
import JoinModal from "@/components/JoinModal.vue";
import ReportModal from "@/components/ReportModal.vue";
import ChatCard from "@/components/ChatCard.vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import firebase from "firebase/app";

export default {
  props: ["isAdmin"],
  computed: {
    progress() {
      return (this.venue.presentCount / this.venue.capacity) * 100;
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
      openChat: -1,
      isEdit: false,
      editedVenue: null,
      showReportModal: false
    };
  },
  watch: {
    venue(newValue) {
      console.log("running watch venue");

      this.editedVenue = newValue; // prefill edit fields
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
        console.log("bindVenue: " + error);
      }
    },
    async acceptOrDeclineGroup(index, userID, count, status) {
      try {
        if (status == "accepted") {
          this.updateMetaInfo("presentCount", this.venue.presentCount + count);
        }
        const waitListItem = {
          waitListID: this.waitList[index].id,
          status
        };
        await this.$store.dispatch("updateWaitList", waitListItem);
      } catch (error) {
        console.log("acceptOrDeclineGroup: " + error);
      }
    },
    async updateMetaInfo(property, newValue) {
      newValue = newValue < 0 ? 0 : newValue; // prevent new value from going negative

      switch (property) {
        case "presentCount":
          this.editedVenue.presentCount = newValue;
          break;
        case "capacity":
          this.editedVenue.capacity = newValue;
      }

      try {
        await this.$store.dispatch("updateVenue", this.editedVenue);
      } catch (error) {
        console.log(error);
      }
    },
    async deleteVenue() {
      // TODO: use Vuetify modal for confirmation
      if (confirm("Weet je zeker dat je het bedrijf wilt verwijderen?")) {
        this.$router.replace("/");
        await this.$store.dispatch("deleteVenue", this.venue);
      }
    },
    async toggleEdit() {
      if (this.isEdit) {
        await this.$store.dispatch("updateVenue", this.editedVenue);
      }
      this.isEdit = !this.isEdit;
    },
    async checkUser(venueID) {
      if (!(await firebase.getCurrentUser())) {
        this.$router.push({
          name: "Login",
          query: { redirect: `/venue/${venueID}` }
        });
      } else {
        this.show = !this.show;
      }
    }
  },
  components: {
    Loading,
    JoinModal,
    ReportModal,
    ChatCard,
    VueQrcode
  },
  created() {
    this.venueID = this.$route.params.venue;
    this.getVenue();
  }
};
</script>
