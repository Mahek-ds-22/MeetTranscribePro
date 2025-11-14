function validateProfile(req, res, next) {
  const { name, voice_sample } = req.body;
  const errors = [];
  if (!name || name.trim().length === 0) errors.push('Profile name is required');
  if (!voice_sample || (Array.isArray(voice_sample.samples) && voice_sample.samples.length < 10)) {
    // lowered for demo; adjust to 50 if you have many samples
    errors.push('Minimum 10 voice samples required (demo)');
  }
  if (errors.length) {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.details = errors;
    error.status = 400;
    return next(error);
  }
  next();
}

function validateTranscript(req, res, next) {
  const { speaker_count } = req.body;
  if (!speaker_count || speaker_count < 1 || speaker_count > 20) {
    const error = new Error('Speaker count must be 1-20');
    error.status = 400;
    return next(error);
  }
  next();
}

module.exports = { validateProfile, validateTranscript };
