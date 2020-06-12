<template>
  <Loading v-if="loadingVenue" />
  <v-container v-else>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card max-width="400" class="mx-auto dark--text" color="info">
          <v-row v-if="venue == null">
            <v-col>
              <h3>No venue information...</h3>
            </v-col>
          </v-row>

          <v-row v-else class="pa-0" no-gutters>
            <v-col
              v-if="isEdit && editedVenue"
              cols="10"
              class="ma-4 dark--text"
            >
              <!-- Venue info fields -->
              <v-text-field
                label="Naam"
                v-model="editedVenue.name"
                prepend-icon="mdi-card-account-details-outline"
              ></v-text-field>
              <v-textarea
                label="Beschrijving"
                v-model="editedVenue.description"
                prepend-icon="mdi-information-outline"
                auto-grow
              ></v-textarea>
              <v-text-field
                label="URL"
                v-model="editedVenue.url"
                prepend-icon="mdi-web"
              ></v-text-field>
              <v-text-field
                label="Tel"
                v-model="editedVenue.phone"
                prepend-icon="mdi-cellphone"
              ></v-text-field>
              <v-text-field
                label="Stad"
                v-model="editedVenue.location.city"
                prepend-icon="mdi-city"
              ></v-text-field>
              <v-text-field
                label="Adres"
                v-model="editedVenue.location.address"
                prepend-icon="mdi-road"
              ></v-text-field>

              Openingstijden
              <OpeningHours :openingHours.sync="openingHours" />

              <!-- Venue capacity -->
              <v-row v-show="isAdmin" class="pa-2" justify="center" no-gutters>
                <v-col>
                  Pas capaciteit aan. Huidig: <b>{{ venue.capacity }}</b>
                </v-col>
              </v-row>

              <v-row v-show="isAdmin">
                <v-col align="center">
                  <v-btn
                    color="secondary"
                    @click="updateMetaInfo('capacity', venue.capacity - 1)"
                    >-</v-btn
                  >
                </v-col>
                <v-col align="center">
                  <v-btn
                    color="primary"
                    @click="updateMetaInfo('capacity', venue.capacity + 1)"
                    >+</v-btn
                  >
                </v-col>
              </v-row>

              <v-row
                v-show="isAdmin"
                class="pa-2 mt-10"
                justify="center"
                no-gutters
              >
                <v-col>
                  <v-btn color="secondary" @click="deleteVenue()"
                    >Verwijder uit Plekkie</v-btn
                  >
                </v-col>
              </v-row>
            </v-col>

            <v-col v-else cols="11">
              <v-card-title
                >{{ venue.name }}
                <v-btn
                  v-if="!isAdmin"
                  @click="showReportModal = !showReportModal"
                  text
                  icon
                  color="accent"
                >
                  <v-icon>mdi-alert-circle-outline</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-subtitle v-if="venue.location" class="semidark--text">
                {{ venue.location.city }}, {{ venue.location.address }}
              </v-card-subtitle>
              <v-card-text>
                <p v-if="venue.description">{{ venue.description }}</p>
                <p class="ma-0 pa-0">
                  <a
                    :href="'//' + venue.url"
                    v-if="venue.url"
                    target="_blank"
                    >{{ venue.url }}</a
                  >
                </p>
                <p v-if="venue.phone">Tel: {{ venue.phone }}</p>
                <v-btn
                  class="my-2 dark--text"
                  color="secondary"
                  @click="showOpeningHours = !showOpeningHours"
                  >Openingstijden</v-btn
                >
                <v-dialog v-model="showOpeningHours" max-width="380">
                  <v-card>
                    <v-card-title v-if="openingHours == undefined">
                      Geen openingstijden beschikbaar
                    </v-card-title>
                    <v-card-title v-else>Openingstijden</v-card-title>
                    <v-card-text v-if="openingHours == undefined">
                      <p v-if="venue.url != undefined && venue.url != ''">
                        Misschien kan je het vinden op de website van
                        <a :href="'//' + venue.url" target="_blank">{{
                          venue.name
                        }}</a>
                        of op
                        <a
                          :href="
                            '//' +
                              'google.com/search?q=Openingstijden+' +
                              venue.name +
                              '+' +
                              venue.location.city
                          "
                          target="_blank"
                        >
                          Google
                        </a>
                      </p>
                      <p v-else>
                        Misschien weet
                        <a
                          :href="
                            '//' +
                              'google.com/search?q=Openingstijden+' +
                              venue.name +
                              '+' +
                              venue.location.city
                          "
                          target="_blank"
                          >Google</a
                        >
                        het wel.
                      </p>
                    </v-card-text>
                    <v-card-text v-else>
                      <p
                        v-for="day in openingHours"
                        :key="day.label"
                        class="ma-0 pa-0"
                      >
                        <!-- {{ day }} -->
                        {{ day.label }}:
                        {{
                          day.openTime == null
                            ? "Gesloten"
                            : day.closeTime == null
                            ? "Gesloten"
                            : day.openTime + " - " + day.closeTime
                        }}
                      </p>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="primary"
                        @click="showOpeningHours = !showOpeningHours"
                      >
                        Sluit
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-text>
              <span class="ml-4 semidark--text">Delen: </span>
              <ShareNetwork
                class="ma-4"
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
                <v-btn color="accent" icon>
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
                <v-btn color="accent" icon>
                  <v-icon>fab fa-facebook-f</v-icon>
                </v-btn>
              </ShareNetwork>
            </v-col>
            <v-col v-show="isAdmin" @click="toggleEdit()" cols="1 pt-4">
              <v-icon color="primary">{{ isEdit ? "done" : "create" }}</v-icon>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>

          <div class="venueInfo" v-if="!isEdit">
            <v-row no-gutters>
              <v-card-title v-if="!isAdmin"
                >Is er nog een plekkie?</v-card-title
              >
              <v-card-title v-else>Huidige bezetting:</v-card-title>
            </v-row>

            <v-row no-gutters>
              <v-col class="my-2">
                <v-progress-linear
                  cols="12"
                  :value="(venue.presentCount / venue.capacity) * 100"
                  height="25"
                  :color="getProgressColor(venue).background"
                  reactive
                >
                  <strong
                    v-if="!isAdmin"
                    :class="getProgressColor(venue).text"
                    >{{
                      venue.presentCount >= venue.capacity
                        ? `${venue.capacity} / ${venue.capacity}`
                        : `${venue.presentCount} / ${venue.capacity}`
                    }}</strong
                  >
                  <strong v-else :class="getProgressColor(venue).text">{{
                    `${venue.presentCount} / ${venue.capacity}`
                  }}</strong>
                </v-progress-linear>
              </v-col>
            </v-row>

            <v-row v-if="!isAdmin" no-gutters>
              <v-col
                cols="12"
                class="pa-4"
                v-if="venue.presentCount >= venue.capacity"
              >
                <v-btn
                  color="secondary"
                  class="dark--text"
                  block
                  @click="checkUser(venue.id)"
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
              <v-col cols="12">
                <v-card-title>{{
                  totalWaiting == 0
                    ? "Ja, er is geen wachtrij!"
                    : `${totalWaiting} wachtenden voor u`
                }}</v-card-title>
              </v-col>
              <v-col
                v-for="person in waitList.slice(0, 4)"
                :key="person.id"
                cols="2"
                class="pa-3"
              >
                <v-badge
                  color="secondary"
                  :content="person.personCount"
                  overlap
                >
                  <v-icon color="dark">mdi-account-group</v-icon>
                </v-badge>
              </v-col>
              <v-icon color="dark" v-if="waitList.length > 5"
                >mdi-dots-horizontal</v-icon
              >
            </v-row>

            <v-card-title v-show="isAdmin">Pas aanwezigen aan:</v-card-title>

            <v-row v-show="isAdmin">
              <v-col align="center">
                <v-btn
                  color="secondary"
                  @click="
                    updateMetaInfo('presentCount', venue.presentCount - 1)
                  "
                  class="info--text"
                  >-</v-btn
                >
              </v-col>
              <v-col align="center">
                <v-btn
                  color="primary"
                  @click="
                    updateMetaInfo('presentCount', venue.presentCount + 1)
                  "
                  class="info--text"
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

    <Loading v-if="loadingWaitList" />

    <v-row v-if="isAdmin" justify="center">
      <v-col
        class="pa-3"
        cols="12"
        v-for="(person, index) in waitList"
        :key="person.id"
      >
        <v-card color="info" max-width="400" class="mx-auto">
          <v-card-title>
            {{ person.userName }}
          </v-card-title>
          <v-card-text> Met {{ person.personCount }} personen. </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              color="secondary"
              @click="
                acceptOrDeclineGroup(
                  index,
                  person.userID,
                  person.personCount,
                  'declined'
                )
              "
            >
              Weiger
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              v-if="!person.awaitingArrival"
              color="secondary"
              @click="
                acceptOrDeclineGroup(
                  index,
                  person.userID,
                  person.personCount,
                  'startTimer'
                )
              "
            >
              Start Timer
            </v-btn>
            <v-btn
              v-else
              color="secondary"
              @click="
                acceptOrDeclineGroup(
                  index,
                  person.userID,
                  person.personCount,
                  'accepted'
                )
              "
            >
              Binnen
            </v-btn>
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
import OpeningHours from "@/components/OpeningHours.vue";
import ReportModal from "@/components/ReportModal.vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import firebase from "firebase/app";
import axios from "axios";

export default {
  props: ["isAdmin"],
  computed: {
    progress() {
      return (this.venue.presentCount / this.venue.capacity) * 100;
    },
    ...mapState(["venue", "waitList", "user"]),
    totalWaiting() {
      return this.waitList.reduce((a, b) => {
        return a + b.personCount;
      }, 0);
    }
  },
  data() {
    return {
      venueID: "",
      loadingVenue: false,
      loadingWaitList: false,
      show: false,
      count: 1,
      isEdit: false,
      editedVenue: null,
      showReportModal: false,
      openingHours: [],
      showOpeningHours: false
    };
  },
  watch: {
    venue(newValue) {
      this.editedVenue = newValue; // prefill edit fields
    },
    async waitList() {
      await this.getUserNames();
      this.$forceUpdate();
    }
  },
  methods: {
    async getVenue() {
      this.loadingVenue = true;
      try {
        await this.$store.dispatch("bindVenue", this.venueID);
        this.openingHours = this.venue.openingHours;

        this.loadingVenue = false;
        this.loadingWaitList = true;
        await this.$store.dispatch("bindWaitList", this.venueID);

        await this.getUserNames();

        this.loadingWaitList = false;
      } catch (error) {
        console.log("bindVenue: " + error);
      }
    },
    async getUserNames() {
      await Promise.all(
        this.waitList.map(async waitListItem => {
          try {
            waitListItem.userName = await this.$store.dispatch(
              "getUserName",
              waitListItem.userID
            );
          } catch (error) {
            console.log(error);
          }
        })
      );
    },
    async acceptOrDeclineGroup(index, userID, count, status) {
      try {
        if (status == "startTimer") {
          await this.$store.dispatch(
            "updateAwaitingArrival",
            this.waitList[index].id
          );
          return;
        }
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
        this.$router.replace("/my-venues");
        await this.$store.dispatch("deleteVenue", this.venue);
      }
    },
    async toggleEdit() {
      if (this.isEdit) {
        const query =
          this.editedVenue.location.address +
          ", " +
          this.editedVenue.location.city;
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search/${query}?format=json&countrycodes=NL&limit=3`
        );
        this.editedVenue.location.geo = new firebase.firestore.GeoPoint(
          parseFloat(res.data[0].lat),
          parseFloat(res.data[0].lon)
        );

        if (this.openingHours != undefined)
          this.editedVenue.openingHours = this.openingHours;

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
    },
    getProgressColor(venue) {
      let progress = (venue.presentCount / venue.capacity) * 100;
      if (progress < 80) return { background: "secondary", text: "dark--text" };
      if (progress < 99) return { background: "secondary", text: "dark--text" };
      return { background: "primary", text: "info--text" };
    }
  },
  components: {
    Loading,
    JoinModal,
    ReportModal,
    VueQrcode,
    OpeningHours
  },
  created() {
    this.venueID = this.$route.params.venue;
    this.getVenue();
  }
};
</script>
