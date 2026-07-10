import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/e2e',timeout:30000,use:{baseURL:process.env.API_TEST_URL||'http://127.0.0.1:3000'},webServer:process.env.API_TEST_URL?undefined:{command:'pnpm start',url:'http://127.0.0.1:3000/health/live',reuseExistingServer:false,timeout:45000}});
