<template>
  <v-container>
    <h1 class="ma-2 info--text">Antwoorden op veel gestelde vragen</h1>
    <h3 class="ma-2 info--text">Ik ben een gast 💁🏽‍♀️🙆🏼‍♂️</h3>
    <p class="info--text">
      Plekkie laat zien waar nu plek is bij jou in de buurt. Heb je zin om toch
      nog snel de deur uit te gaan voor een chilling en een drankje in je
      favoriete bar of discotheek met je kameraden en vriendinnen? Check
      plekkie!
    </p>
    <p class="info--text">
      Natuurlijk heeft niemand zin om in de rij staan en vanaf nu hoeft dat niet
      meer! Met plekkie kun je deelnemen in een digitale wachtrij, gewoon thuis
      op de bank. Zodra er plek is voor jou en je gezelschap, krijg je een
      melding. Claim je plekkie binnen 15 min en je bent klaar om te gaan! Zo
      niet, is diegene achter jou in de rij aan de beurt. Easy peasy!
    </p>

    <v-expansion-panels>
      <v-expansion-panel
        class="dark--text"
        v-for="(q, i) in userQuestions"
        :key="i"
      >
        <v-expansion-panel-header
          >{{ q.title }}
          <template v-slot:actions>
            <v-icon color="secondary">$expand</v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          {{ q.text }}
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <h3 class="ma-2 info--text">Ik ben een ondernemer 👩🏼‍🚀</h3>
    <p class="info--text">
      Plekkie helpt je horecaonderneming met het maximaliseren van de
      capaciteit. De Rijksoverheid legt door COVID-19 beperkingen op het aantal
      klanten en als ondernemer wil je de beschikbare plekken zo goed en veilig
      mogelijk benutten.
    </p>
    <p class="info--text">
      Natuurlijk zit niemand te wachten op tijdslots met vaste reserveringen.
      Als horecaondernemer wil je een bar of discotheek zo snel mogelijk vullen
      met klanten. Check Plekkie!
    </p>
    <p class="info--text">
      Geef je klanten inzicht wanneer ze een bezoek kunnen brengen aan je zaak.
      Voorkom drukte aan de deur en verkoop minder nee’s, want dat is voor
      niemand leuk. Houd je bezig met je passie, en creëer een gezellige avond
      voor iedereen in je zaak!
    </p>
    <v-expansion-panels>
      <v-expansion-panel
        class="dark--text"
        v-for="(q, i) in ownerQuestions"
        :key="i"
      >
        <v-expansion-panel-header
          >{{ q.title }}
          <template v-slot:actions>
            <v-icon color="secondary">$expand</v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          {{ q.text }}
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      userQuestions: [
        {
          title: "Hoe gebruik ik Plekkie?",
          text:
            "● Zoek jou stekkie door plaatsnaam of postcode in te voeren ● Zie meteen of er plek is. Zo ja, let’s go! ● Geen plek? Meld je eerst nog even aan als gast ● Neem deel in de wachtrij ● Houd de wachtruimte in de gaten om te zien wanneer je plekkie vrij komt ● Claim je plekkie binnen 15 min ● Laat de timer zien bij de ingang en je kan naar binnen!"
        }
      ],
      ownerQuestions: [
        {
          title: "Hoe gebruik ik Plekkie?",
          text:
            "Meld je aan als ondernemer ● Houd het aantal aanwezigen bij via de app ● Accepteer klanten in de wachtrij zodra er plek is ● Controleer de app van de klant bij de ingang"
        }
      ]
    };
  }
};
</script>
