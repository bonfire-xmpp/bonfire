import {Install} from "@/@types/plugins";
import { isPlatform } from "@ionic/vue";

const functions = {
    isMobileOrTablet: isPlatform("mobile") || isPlatform("tablet"),
    isMobile: isPlatform("mobile"),
    isTablet: isPlatform("tablet"),
    isDesktop: isPlatform("desktop"),
    isElectron: isPlatform("electron"),
};

declare module '@/plugins' {
    export interface PluginsInterface {
        $device: typeof functions;
    }
}

export default ((ctx, inject) => {
    inject("device", functions);
}) as Install;
