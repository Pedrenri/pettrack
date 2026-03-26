import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.pettrack.app",
  appName: "PetTrack",
  webDir: "public",
  server: {
    url: "https://pettrack.vercel.app",
    cleartext: true
  }
}

export default config;
