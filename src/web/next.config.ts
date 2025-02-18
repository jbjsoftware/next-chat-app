import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_RESOURCE_NAME: process.env.AZURE_OPENAI_RESOURCE_NAME,
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION,
  },
};

export default nextConfig;
