import { cloudflare } from "@cloudflare/vite-plugin";
import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

export default defineConfig({
  plugins: [
    vinext(),
    sites({ mockAuth: true }),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      inspectorPort: false,
      config: {
        main: "vinext/server/fetch-handler",
        compatibility_flags: ["nodejs_compat"],
        d1_databases: hostingConfig.d1
          ? [
              {
                binding: hostingConfig.d1,
                database_name: "boostsync-local",
                database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
              },
            ]
          : [],
      },
    }),
  ],
});
