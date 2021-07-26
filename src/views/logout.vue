<script>
import { plugins } from "@/plugins";

export default {
    name: "logout",
    beforeRouteEnter() {
      plugins.$stanza.logout();
      return '/login';
    },
    middleware({ $stanza, redirect }) {
      $stanza.logout();
      return redirect('/login');
    }
  }
</script>
