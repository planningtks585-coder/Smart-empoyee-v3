import { runBackendTests } from '../src/backend/testRunner';

async function main() {
  console.log('====================================================');
  console.log('  Marketing Landmark - Headless Backend Test Suite  ');
  console.log('====================================================\n');

  const result = await runBackendTests();

  for (const suite of result.suites) {
    const symbol = suite.passed ? '✓' : '✗';
    console.log(`${symbol} ${suite.suiteName} (${suite.durationMs}ms) - ${suite.passedTests}/${suite.totalTests} passed`);
    for (const test of suite.tests) {
      const subSymbol = test.passed ? '  ✓' : '  ✗';
      console.log(`${subSymbol} ${test.name}`);
      if (test.error) {
        console.log(`      Error: ${test.error}`);
      }
    }
    console.log('');
  }

  console.log('----------------------------------------------------');
  console.log(`Summary: ${result.passedSuites}/${result.totalSuites} suites passed in ${result.totalDurationMs}ms`);
  console.log(`Status: ${result.allPassed ? 'ALL TESTS PASSED (100% OK)' : 'SOME TESTS FAILED'}`);
  console.log('====================================================\n');

  if (!result.allPassed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
