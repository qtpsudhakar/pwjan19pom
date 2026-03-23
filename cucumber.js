module.exports = {
  default: {
    // Feature files location
    paths: ['features/**/login.feature'],
    
    // Step definitions location
    // CHOOSE ONE OF THESE APPROACHES:
    
    // Option 1: Use POM approach (with page objects)
    require: ['steps/**/login.steps.ts', 'steps/world.ts'],
    
    // Option 2: Use Simple approach (without POM - direct Playwright)
    // require: ['steps/login-simple.steps.ts', 'steps/simpleWorld.ts'],
    
    // World parameters
    worldParameters: {
      // Add any world configuration here
    },
    
    // Format options
    format: [
      'html:cucumber-report.html',
      'json:cucumber-report.json',
      '@cucumber/pretty-formatter'
    ],
    
    // // Require TypeScript setup
    // requireModule: ['ts-node/register'],
    
    // Tags to run (optional - remove to run all)
    // tags: '@smoke or @login',
    
    // Parallel execution (optional)
    // parallel: 2,
    
    // Retry failed scenarios
    retry: 0,
    
    // Exit after first failure (optional)
    // failFast: true,
  }
};