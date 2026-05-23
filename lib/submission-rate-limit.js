const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function getRetryAfterSeconds(lastSubmittedAt, now = new Date()) {
  const elapsed = now.getTime() - lastSubmittedAt.getTime();
  const remainingMs = RATE_LIMIT_WINDOW_MS - elapsed;
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

function isWithinSubmitWindow(lastSubmittedAt, now = new Date()) {
  return getRetryAfterSeconds(lastSubmittedAt, now) > 0;
}

module.exports = {
  RATE_LIMIT_WINDOW_MS,
  getRetryAfterSeconds,
  isWithinSubmitWindow,
};
