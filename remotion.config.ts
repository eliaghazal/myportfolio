/**
 * Remotion CLI configuration.
 *
 * This file is used when rendering the video to MP4 via:
 *   npm run render-video
 *   (or: npx remotion render IntroVideo out/intro.mp4)
 *
 * And when previewing in the Remotion Studio:
 *   npx remotion studio
 *
 * @see https://www.remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./remotion/Root.tsx");

// 1920×1080 full HD — matches the Composition settings in Root.tsx
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
