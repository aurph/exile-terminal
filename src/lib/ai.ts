/**
 * Server-only flag: are the AI features (the Oracle and its pages) enabled?
 * Tied to whether an Anthropic key is configured, so a public deploy with no
 * key ships with zero AI surface and zero per-use cost. Set ANTHROPIC_API_KEY
 * on your own instance to bring the Oracle back.
 */
export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
