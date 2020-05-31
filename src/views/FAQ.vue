<template>
  <v-container>
    <h1 class="ma-2">Antwoorden op veel gevraagde vragen</h1>
    <v-expansion-panels>
      <v-expansion-panel v-for="(q, i) in questions" :key="i">
        <v-expansion-panel-header>{{ q.title }}</v-expansion-panel-header>
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
      questions: [
        { title: "Waarom zou ik Plekkie gebruiken?", text: "uitleg 1..." },
        { title: "Hoe gebruik ik Plekkie?", text: "uitleg 2..." },
        { title: "Voor wie is Plekkie?", text: "uitleg 3..." }
      ]
    };
  }
};
</script>
