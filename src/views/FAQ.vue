<template>
  <v-container>
    <h1 class="ma-2 info--text">Antwoorden op veel gestelde vragen</h1>
    <h3 class="ma-2 info--text">Ik ben een ondernemer 👩🏼‍🚀</h3>
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

    <h3 class="ma-2 info--text">Ik ben een gast 💁🏽‍♀️🙆🏼‍♂️</h3>
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
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      ownerQuestions: [
        { title: "Waarom zou ik Plekkie gebruiken??", text: "uitleg 1..." },
        { title: "Hoe gebruik ik Plekkie?", text: "uitleg 2..." },
        { title: "Voor wie is Plekkie?", text: "uitleg 3..." }
      ],
      userQuestions: [
        { title: "Waarom zou ik Plekkie gebruiken?", text: "uitleg 1..." },
        { title: "Hoe gebruik ik Plekkie?", text: "uitleg 2..." },
        { title: "Voor wie is Plekkie?", text: "uitleg 3..." }
      ]
    };
  }
};
</script>
