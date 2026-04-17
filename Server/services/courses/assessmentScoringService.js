export const calculateAssessmentScore = (assessment, responses) => {
  let totalScore = 0;
  const maxScore = assessment.scoringConfig.maxScore;
  const subscaleScores = {};

  // Initialize subscale tracking
  if (assessment.scoringConfig.subscales) {
    assessment.scoringConfig.subscales.forEach((subscale) => {
      subscaleScores[subscale.domain] = {
        name: subscale.name,
        domain: subscale.domain,
        score: 0,
        maxScore: subscale.maxScore,
        weight: subscale.weight,
      };
    });
  }

  // Calculate scores
  responses.forEach((response) => {
    const question = assessment.questions.find(
      (q) => q._id.toString() === response.questionId.toString()
    );

    if (!question) return;

    let score = 0;

    // Get the value based on question type
    if (question.questionType === "rating") {
      score = response.value * (question.options[0]?.weight || 1);
    } else if (
      ["frequency", "likert", "singleChoice", "multipleChoice"].includes(
        question.questionType
      )
    ) {
      const option = question.options.find(
        (opt) => opt.text === response.answer
      );
      if (option) {
        score = option.value * (option.weight || 1);
      }
    } else if (question.questionType === "yesNo") {
      score = response.answer === "Yes" ? 1 : 0;
    }

    // Apply reverse scoring if needed
    if (question.reverseScored && question.options) {
      const maxQuestionScore = Math.max(
        ...question.options.map((o) => o.value)
      );
      score = maxQuestionScore - score;
    }

    // Add to total
    totalScore += score;

    // Add to subscale if domain is tracked
    if (question.domain && subscaleScores[question.domain]) {
      subscaleScores[question.domain].score += score;
    }
  });

  // Calculate percentage
  const percentage =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Determine severity level
  const severityLevel = assessment.scoringConfig.severityLevels.find(
    (level) => totalScore >= level.minScore && totalScore <= level.maxScore
  );

  // Calculate subscale percentages and severity
  const formattedSubscales = Object.values(subscaleScores).map((subscale) => {
    const subscalePercentage =
      subscale.maxScore > 0
        ? Math.round((subscale.score / subscale.maxScore) * 100)
        : 0;

    // Find subscale severity if configured
    const subscaleConfig = assessment.scoringConfig.subscales?.find(
      (s) => s.domain === subscale.domain
    );

    let subscaleSeverity = null;
    if (subscaleConfig?.severityLevels) {
      subscaleSeverity = subscaleConfig.severityLevels.find(
        (level) =>
          subscale.score >= level.minScore && subscale.score <= level.maxScore
      );
    }

    return {
      name: subscale.name,
      domain: subscale.domain,
      score: subscale.score,
      maxScore: subscale.maxScore,
      percentage: subscalePercentage,
      severityLevel: subscaleSeverity
        ? {
            level: subscaleSeverity.level,
            label: subscaleSeverity.label,
            description: subscaleSeverity.description,
          }
        : null,
    };
  });

  // Check clinical cutoffs
  const clinicalFlags = [];
  if (assessment.scoringConfig.clinicalCutoffs) {
    assessment.scoringConfig.clinicalCutoffs.forEach((cutoff) => {
      const met = totalScore >= cutoff.score;
      clinicalFlags.push({
        cutoffName: cutoff.name,
        score: totalScore,
        threshold: cutoff.score,
        met,
        description: cutoff.description,
        tags: cutoff.tags || [],
      });
    });
  }

  // Check pass/fail
  let passed = null;
  if (assessment.scoringConfig.passingScore !== null) {
    passed = totalScore >= assessment.scoringConfig.passingScore;
  }

  return {
    totalScore,
    maxScore,
    percentage,
    severityLevel: severityLevel
      ? {
          level: severityLevel.level,
          label: severityLevel.label,
          color: severityLevel.color,
          description: severityLevel.description,
          recommendations: severityLevel.recommendations,
        }
      : null,
    subscaleScores: formattedSubscales,
    clinicalFlags,
    passed,
  };
};
