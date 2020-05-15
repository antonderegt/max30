<template>
  <div class="login">
    <img alt="Vue logo" src="../assets/logo.png" />
    <h3>Login</h3>
    <!-- <div class="row">
    <form class="col s12">
      <div class="row">
        <div class="input-field col s6">
          <input placeholder="Email" id="first_name" type="text" class="validate"> 
          <input placeholder="Email" id="first_name" type="email" >
          <label for="first_name">First Name</label>
        </div>
        </div>
      <div class="row">
        <div class="input-field col s6">
          <input placeholder="Password" id="last_name" type="text" class="validate">
          <label for="last_name">Last Name</label>
        </div>
      </div>
    </form>
     </div> -->
    <input
      type="text"
      v-model="email"
      placeholder="Email address"
      class="input"
      required
    />
    <br />
    <input
      type="password"
      v-model="password"
      placeholder="Password"
      class="input"
      required
    />
    <br />
    <button @click="login" class="button">Enter</button>
    <p>
      <router-link to="/signup">
        New Here? Create a new account
      </router-link>
    </p>
  </div>
</template>

<script>
import firebase from "firebase/app";

export default {
  name: "login",
  data: function() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    login() {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then(user => {
          console.log(user);

          this.$router.replace("/");
        })
        .catch(err => {
          alert(err.message);
        });
    }
  }
};
</script>
