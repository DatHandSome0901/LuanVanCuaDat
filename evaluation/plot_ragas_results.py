"""
plot_ragas_results.py
=====================
Đọc ragas_summary_results.csv và vẽ:
  Figure_2_RAGAS_Performance_Comparison.png

Biểu đồ grouped bar chart so sánh:
  - ItihashQA Baseline (màu xám)   vs   TALRAG (màu xanh)
Theo 4 metric RAGAS × 3 mức difficulty.

Yêu cầu:
  pip install matplotlib pandas
"""

import sys
from pathlib import Path

import pandas as pd
import matplotlib
matplotlib.use("Agg")   # non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

# ─── Paths ────────────────────────────────────────────────────────────────────
EVAL_DIR    = Path(__file__).resolve().parent
SUMMARY_CSV = EVAL_DIR / "ragas_summary_results.csv"
OUTPUT_PNG  = EVAL_DIR / "Figure_2_RAGAS_Performance_Comparison.png"

# ─── Style ────────────────────────────────────────────────────────────────────
BASELINE_COLOR = "#8E9BA8"   # slate grey  → ItihashQA Baseline
TALRAG_COLOR   = "#2A6EBB"   # royal blue  → TALRAG

METRICS = [
    "faithfulness",
    "answer_relevancy",
    "context_precision",
    "context_recall",
]
METRIC_LABELS = [
    "Faithfulness",
    "Answer\nRelevancy",
    "Context\nPrecision",
    "Context\nRecall",
]
DIFFICULTIES = ["easy", "medium", "hard"]
DIFFICULTY_LABELS = ["Easy", "Medium", "Hard"]

SYSTEMS = ["itihashqa_baseline", "talrag"]
SYSTEM_LABELS = {
    "itihashqa_baseline": "ItihashQA Baseline",
    "talrag":             "TALRAG",
}
SYSTEM_COLORS = {
    "itihashqa_baseline": BASELINE_COLOR,
    "talrag":             TALRAG_COLOR,
}


def load_summary(path: Path) -> pd.DataFrame:
    if not path.exists():
        print(f"❌ Summary file not found: {path}")
        print("  → Chạy evaluate_ragas.py trước.")
        sys.exit(1)
    df = pd.read_csv(path)
    print(f"[PLOT] Loaded {len(df)} rows from {path.name}")
    # Điền 0 nếu thiếu metric
    for m in METRICS:
        if m not in df.columns:
            df[m] = 0.0
    return df


def plot(df: pd.DataFrame):
    """
    Layout: 4 metric × 3 difficulty = 12 grouped bar pairs.
    Tổ chức thành grid 2×2 (mỗi subplot = 1 metric, x-axis = difficulty).
    """

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.patch.set_facecolor("#F8F9FA")

    axes_flat = axes.flatten()

    bar_width = 0.3
    x = np.arange(len(DIFFICULTIES))   # [0, 1, 2]

    for ax_idx, (metric, metric_label) in enumerate(zip(METRICS, METRIC_LABELS)):
        ax = axes_flat[ax_idx]
        ax.set_facecolor("#FFFFFF")

        offsets = [-bar_width / 2, bar_width / 2]  # baseline left, talrag right

        for sys_idx, system in enumerate(SYSTEMS):
            values = []
            for diff in DIFFICULTIES:
                row = df[(df["difficulty"] == diff) & (df["system"] == system)]
                if row.empty:
                    values.append(0.0)
                else:
                    values.append(float(row[metric].values[0]))

            bars = ax.bar(
                x + offsets[sys_idx],
                values,
                width=bar_width,
                color=SYSTEM_COLORS[system],
                edgecolor="white",
                linewidth=0.8,
                alpha=0.92,
                zorder=3,
                label=SYSTEM_LABELS[system],
            )

            # Label trên mỗi cột
            for bar, val in zip(bars, values):
                if val > 0:
                    ax.text(
                        bar.get_x() + bar.get_width() / 2,
                        bar.get_height() + 0.012,
                        f"{val:.2f}",
                        ha="center",
                        va="bottom",
                        fontsize=8.5,
                        fontweight="bold",
                        color="#333333",
                    )

        # Trục và trang trí
        ax.set_xticks(x)
        ax.set_xticklabels(DIFFICULTY_LABELS, fontsize=11)
        ax.set_ylim(0, 1.15)
        ax.set_ylabel("Score", fontsize=10, labelpad=6)
        ax.set_title(metric_label.replace("\n", " "), fontsize=13, fontweight="bold", pad=8)
        ax.yaxis.grid(True, linestyle="--", alpha=0.5, zorder=0)
        ax.set_axisbelow(True)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.tick_params(axis="both", labelsize=10)

    # ─── Legend chung ────────────────────────────────────────────────────────
    legend_handles = [
        mpatches.Patch(color=BASELINE_COLOR, label="ItihashQA Baseline"),
        mpatches.Patch(color=TALRAG_COLOR,   label="TALRAG"),
    ]
    fig.legend(
        handles=legend_handles,
        loc="lower center",
        ncol=2,
        fontsize=12,
        frameon=True,
        framealpha=0.9,
        edgecolor="#CCCCCC",
        bbox_to_anchor=(0.5, 0.02),
    )

    # ─── Tiêu đề và caption ──────────────────────────────────────────────────
    fig.suptitle(
        "RAGAS Performance Comparison: ItihashQA Baseline vs. TALRAG",
        fontsize=15,
        fontweight="bold",
        y=0.98,
        color="#1A1A2E",
    )

    caption = (
        "Figure 2. RAGAS performance comparison between the ItihashQA baseline "
        "and the proposed TALRAG framework."
    )
    fig.text(
        0.5, 0.005,
        caption,
        ha="center",
        fontsize=10,
        style="italic",
        color="#555555",
    )

    plt.tight_layout(rect=[0, 0.08, 1, 0.96])

    fig.savefig(OUTPUT_PNG, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"\n[PLOT] Figure saved → {OUTPUT_PNG}")


def main():
    df = load_summary(SUMMARY_CSV)
    plot(df)
    print("[PLOT] Done!")


if __name__ == "__main__":
    main()
