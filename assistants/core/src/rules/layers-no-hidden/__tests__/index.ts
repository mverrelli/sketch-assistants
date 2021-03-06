import { testCoreRule } from '../../../test-helpers'

describe('layers-no-hidden', () => {
  test('no violations for visible layers', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './visible-layer.sketch',
      'layers-no-hidden',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for hidden layers', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './hidden-layer.sketch',
      'layers-no-hidden',
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})
