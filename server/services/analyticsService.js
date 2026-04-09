/**
 * Compute analytics from a list of CF submissions
 */

const computeAnalytics = (submissions) => {
  const acceptedMap = new Map(); // problemKey -> submission (deduplicated)

  submissions.forEach((sub) => {
    if (sub.verdict === 'OK') {
      const key = `${sub.contestId}-${sub.problem.index}`;
      if (!acceptedMap.has(key)) {
        acceptedMap.set(key, sub);
      }
    }
  });

  const accepted = Array.from(acceptedMap.values());

  // Topic breakdown
  const topicBreakdown = {};
  accepted.forEach((sub) => {
    (sub.problem.tags || []).forEach((tag) => {
      topicBreakdown[tag] = (topicBreakdown[tag] || 0) + 1;
    });
  });

  // Difficulty breakdown (by rating buckets)
  const difficultyBreakdown = { unrated: 0 };
  accepted.forEach((sub) => {
    const r = sub.problem.rating;
    if (!r) { difficultyBreakdown['unrated']++; return; }
    
    // Bucket with a step of 100 (e.g., 800-899 -> "800")
    const bucket = String(Math.floor(r / 100) * 100);
    difficultyBreakdown[bucket] = (difficultyBreakdown[bucket] || 0) + 1;
  });

  // Ensure buckets are sorted for the chart
  const sortedDifficulty = Object.fromEntries(
    Object.entries(difficultyBreakdown).sort((a, b) => {
      if (a[0] === 'unrated') return -1;
      if (b[0] === 'unrated') return 1;
      return Number(a[0]) - Number(b[0]);
    })
  );

  // Language breakdown
  const languageBreakdown = {};
  submissions.forEach((sub) => {
    const lang = sub.programmingLanguage || 'Unknown';
    languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;
  });

  // Verdict breakdown
  const verdictBreakdown = {};
  submissions.forEach((sub) => {
    const v = sub.verdict || 'UNKNOWN';
    verdictBreakdown[v] = (verdictBreakdown[v] || 0) + 1;
  });

  // Submission heatmap (date -> count)
  const heatmap = {};
  submissions.forEach((sub) => {
    const date = new Date(sub.creationTimeSeconds * 1000)
      .toISOString()
      .split('T')[0];
    heatmap[date] = (heatmap[date] || 0) + 1;
  });

  // Per-topic problem details
  const topicProblems = {};
  accepted.forEach((sub) => {
    (sub.problem.tags || []).forEach((tag) => {
      if (!topicProblems[tag]) topicProblems[tag] = [];
      topicProblems[tag].push({
        name: sub.problem.name,
        rating: sub.problem.rating || null,
        contestId: sub.contestId,
        index: sub.problem.index,
        solvedAt: new Date(sub.creationTimeSeconds * 1000).toISOString(),
      });
    });
  });

  return {
    totalSolved: accepted.length,
    totalSubmissions: submissions.length,
    topicBreakdown,
    difficultyBreakdown: sortedDifficulty,
    languageBreakdown,
    verdictBreakdown,
    heatmap,
    topicProblems,
  };
};

module.exports = { computeAnalytics };
