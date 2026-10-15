"""Recompute within-campaign precision from the accompanying public process means.

Requires Python 3 and NumPy (original analysis: NumPy 2.5.4).
Download process-analysis.json beside this file, then run: python reanalyze.py
No GPU access. This cannot validate raw timings or estimate unseen/day-to-day noise.
"""
import json
import math
from pathlib import Path
import numpy as np

source = json.loads(Path(__file__).with_name('process-analysis.json').read_text())
rng = np.random.default_rng(source['seed'])
results = []
for row in source['conditions']:
    x = np.sort(row['process_values_ms'])
    assert len(x) == 10
    median = float(np.median(x))
    def errors():
        a = np.median(rng.choice(x, (50000, 10)), axis=1)
        b = np.median(rng.choice(x, (50000, 10)), axis=1)
        return np.log(b / a)
    threshold = float(np.quantile(np.abs(errors()), .95))
    e = errors()
    power = min(float(np.mean(np.abs(e + math.log(1.1)) > threshold)),
                float(np.mean(np.abs(e + math.log(.9)) > threshold)))
    cv = float(np.std(x, ddof=1) / np.mean(x) * 100)
    coverage = 1 - 2 * sum(math.comb(10, j) for j in range(2)) / 2**10
    assert math.isclose(median, row['median_ms'])
    assert math.isclose(cv, row['process_cv_pct'])
    assert coverage == row['median_ci_coverage']
    assert float(x[1]) == row['median_ci_low_ms']
    assert float(x[-2]) == row['median_ci_high_ms']
    results.append(dict(experiment_id=row['experiment_id'], phase=row['phase'],
                        median_ms=median, process_cv_pct=cv,
                        median_ci_ms=[float(x[1]), float(x[-2])],
                        individual_coverage=coverage,
                        empirical_power_10pct_both_directions=power))
print(json.dumps(dict(scope='Retrospective empirical sensitivity, not prospective power',
                      conditions=results), indent=2))
