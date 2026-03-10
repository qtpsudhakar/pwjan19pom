// global-teardown.ts
export default async function globalTeardown() {
  // Runs once after all tests finish
  // Clean up files, notify services, record completion
  console.log('Global teardown complete');
}
