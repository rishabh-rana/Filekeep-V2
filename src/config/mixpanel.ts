import mixpanel from "mixpanel-browser";
import { MixpanelConfig } from "./keys";

mixpanel.init(MixpanelConfig.key);

export default mixpanel;
