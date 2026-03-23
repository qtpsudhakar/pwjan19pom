module.exports = {
  default: {
    // Feature files location
    paths: ['features/**/login.feature'],
    
    // Step definitions location
    require: ['steps/**/login.steps.ts'],
    
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