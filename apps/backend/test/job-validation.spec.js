import { expect } from 'chai';
import { jobInputSchema } from '../src/services/validation.js';

describe('jobInputSchema', () => {
  it('applies defaults for optional fields', () => {
    const result = jobInputSchema.parse({
      mood: 'calm',
      genre: 'ambient',
      topic: 'night drive',
    });

    expect(result.language).to.equal('english');
    expect(result.style).to.equal('cinematic');
    expect(result.durationSeconds).to.equal(90);
  });

  it('rejects very short fields', () => {
    expect(() =>
      jobInputSchema.parse({
        mood: 'x',
        genre: 'pop',
        topic: 'love',
      })
    ).to.throw();
  });
});
