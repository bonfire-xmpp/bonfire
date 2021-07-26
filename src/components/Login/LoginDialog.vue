<template>
  <div :loading="loading" class="flex flex-col bg-grey-100 rounded-lg shadow-lg">
    <div class="p-6 pb-0 space-y-5">

      <div>
        <campfire class="mx-auto h-24 w-auto text-grey-300"/>
        <h2 class="mt-4 text-center text-3xl font-extrabold text-grey-800 select-none">
          Sign in to your account
        </h2>
      </div>

      <form class="" @submit.prevent="submit">
        <div class="rounded-md -space-y-px">
          <div class="px-2 pb-1 text-sm sm:text-xs text-error inline-block">{{ jidError }}<br></div>
          <div>
            <label for="email-address" class="sr-only">JID</label>
            <input id="email-address" name="jid" type="email" autocomplete="jid" required
                   v-model="jid"
                   class="bg-black-darken rounded-t-md input-primary" :class="jidError && 'input-error'" placeholder="JID" />
          </div>

          <div class="shadow-sm">
            <label for="password" class="sr-only">Password</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required
                   v-model="password"
                   class="bg-black-darken rounded-b-md input-primary" :class="passwordError && 'input-error'" placeholder="Password" />
          </div>
          <p class="px-2 pt-1 text-sm sm:text-xs text-error">{{ jidError !== passwordError && passwordError ? passwordError : '' }}<br></p>
        </div>

        <disclosure v-slot="{open}">
          <disclosure-button
              class="flex justify-between w-full px-4 py-2 mt-2 text-sm text-left rounded-md relative focus:z-10 btn-secondary">
            <span>Custom transport links</span>
            <chevron-up
                :class="open && 'transform rotate-180'"
                class="transition-transform"
                height="18px" width="18px"/>
          </disclosure-button>
          <disclosure-panel class="bg-grey-200 p-2 pt-4 -mt-1 rounded-b-lg shadow-inner">
            <div class="shadow-sm space-y-1">
              <div>
                <label for="bosh-url" class="sr-only">BOSH URL</label>
                <input id="bosh-url" name="bosh" type="url" autocomplete="bosh"
                       v-model="boshUrl"
                       class="rounded-md input-secondary" placeholder="BOSH URL" />
              </div>
              <div>
                <label for="wss-url" class="sr-only">WebSocket URL</label>
                <input id="wss-url" name="wss" type="url" autocomplete="wss-xmpp"
                       v-model="wssUrl"
                       class="rounded-md input-secondary" placeholder="WebSocket URL" />
              </div>
            </div>
          </disclosure-panel>
        </disclosure>

      </form>
    </div>

    <div class="flex-grow"/>

    <div class="mt-16">
      <button v-if="false" :disabled="loading" type="submit" class="w-full flex justify-center h-12 p-4 btn-secondary">
        Register
      </button>
      <button :disabled="loading" type="submit" class="w-full flex justify-center h-12 p-4 rounded-b-md btn-primary" @click="submit">
        Log in
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {Campfire, ChevronUp} from 'mdue';
import {Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/vue'
import {useStore} from "vuex";
import {computed, defineComponent, ref, watch} from "vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import Store from "@/store";
import {useRouter} from "vue-router";

type LoginSettings = {jid: string; password: string; transports?: {bosh: string; websocket: string}}

export default defineComponent({
  name: "LoginDialog",
  components: {Disclosure, DisclosureButton, DisclosurePanel, ChevronUp, Campfire},
  setup() {
    const jid = ref('');
    const password = ref('');

    const jidError = ref('');
    const passwordError = ref('');


    const boshUrl = ref('');
    const wssUrl = ref('');

    const validate = (jid: string): boolean => {
      let valid = true;
      console.log(jid);
      if(!/.+@.+/.test(jid)) {
        valid = false;
        jidError.value = 'Invalid JID';
      }

      if(valid) {
        jidError.value = '';
        passwordError.value = '';
      }

      return valid;
    };

    const store = useStore();
    const router = useRouter()
    const login = async (data: LoginSettings) => {
      await store.dispatch(Store.$actions.login, data)
      await router.push('/');
    };

    const submit = () => {
      const options: LoginSettings = {jid: jid.value, password: password.value};
      if(boshUrl.value || wssUrl.value) {
        options.transports = {
          bosh: boshUrl.value,
          websocket: wssUrl.value
        }
      }
      validate(options.jid) && login(options);
    };

    const authFailed  = computed(() => store.getters[Store.$getters.authFailed]);
    const loginFailed = computed(() => store.getters[Store.$getters.loginFailed]);
    watch(
        [authFailed, loginFailed],
        (l) => {
          if(l[0] && l[1]) {
            jidError.value = 'Invalid JID or password';
            passwordError.value = 'Invalid JID or password';
          } else if(!l[0] && l[1]) {
            jidError.value = "Couldn't connect to server";
          }
        }
    );

    const loading = computed(() => store.getters[Store.$getters.loggingIn]);

    return {
      jid,
      password,
      jidError,
      passwordError,
      loading,
      boshUrl,
      wssUrl,
      submit,
    }
  },
})
</script>

<style scoped>
.btn-primary {
  @apply select-none font-medium text-white bg-opacity-70 bg-green-darken hover:bg-green-darken focus:outline-none focus:ring-4 focus:ring-grey-300
}

.btn-secondary {
  @apply select-none font-medium text-white bg-grey-300 hover:bg-grey-400 focus:outline-none focus:ring-4 focus:ring-primary
}

.input-primary {
  @apply appearance-none relative block w-full px-3 py-2 border border-grey-400 placeholder-grey-500 text-grey-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm
}

.input-secondary {
  @apply appearance-none bg-black relative block w-full border border-grey-300 placeholder-grey-500 text-grey-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm
}

.input-error {
  @apply border border-error focus:border-error focus:ring-error z-10
}
</style>
