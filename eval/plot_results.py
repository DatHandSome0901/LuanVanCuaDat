import sys
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

EVAL_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = EVAL_DIR.parent

RESULTS_DIR = PROJECT_ROOT / "results"
CHARTS_DIR = RESULTS_DIR / "charts"
CHARTS_DIR.mkdir(parents=True, exist_ok=True)

# Input files
OVERALL_CSV = RESULTS_DIR / "ragas_scores_overall.csv"
DIFFICULTY_CSV = RESULTS_DIR / "ragas_scores_by_difficulty.csv"

# Style / Colors — 5 systems
SYSTEM_COLORS = {
    "talrag":             "#2A6EBB",  # Royal blue
    "itihashqa_baseline": "#8E9BA8",  # Slate grey
    "notebooklm":         "#FFB300",  # Amber
    "gemini_gems":        "#AB47BC",  # Purple
    "custom_gpt":         "#10A37F",  # Green
}

SYSTEM_LABELS = {
    "talrag":             "TALRAG",
    "itihashqa_baseline": "ItihashQA Baseline",
    "notebooklm":         "NotebookLM",
    "gemini_gems":        "Gemini Gems",
    "custom_gpt":         "Custom GPT",
}

ALL_SYSTEMS = ["talrag", "itihashqa_baseline", "notebooklm", "gemini_gems", "custom_gpt"]
RAGAS_METRICS = ["faithfulness", "answer_relevancy", "context_precision", "context_recall"]
METRIC_LABELS  = ["Faithfulness", "Answer Relevancy", "Context Precision", "Context Recall"]


def load_data():
    if not OVERALL_CSV.exists() or not DIFFICULTY_CSV.exists():
        print("Error: RAGAS evaluation CSV files not found. Please run evaluate_ragas.py first.")
        sys.exit(1)
    overall_df    = pd.read_csv(OVERALL_CSV)
    difficulty_df = pd.read_csv(DIFFICULTY_CSV)
    return overall_df, difficulty_df


def _get_val(df, sys_name, metric, difficulty=None):
    """Return metric value for a system (and optional difficulty), or 0.0."""
    if difficulty:
        sub = df[(df["system"] == sys_name) & (df["difficulty"] == difficulty)]
    else:
        sub = df[df["system"] == sys_name]
    if sub.empty or metric not in sub.columns:
        return 0.0
    v = sub[metric].values[0]
    return float(v) if not pd.isna(v) else 0.0


# ── Chart 1: Overall RAGAS — 5 systems ─────────────────────────────────────
def plot_overall_ragas_comparison(overall_df):
    """Grouped bar chart: 5 systems × 4 metrics."""
    n_sys = len(ALL_SYSTEMS)
    bar_width = 0.15
    x = np.arange(len(RAGAS_METRICS))
    offsets = np.linspace(-(n_sys - 1) / 2 * bar_width,
                           (n_sys - 1) / 2 * bar_width, n_sys)

    fig, ax = plt.subplots(figsize=(13, 6))
    fig.patch.set_facecolor("#F8F9FA")
    ax.set_facecolor("#FFFFFF")

    for idx, sys in enumerate(ALL_SYSTEMS):
        values = [_get_val(overall_df, sys, m) for m in RAGAS_METRICS]
        bars = ax.bar(
            x + offsets[idx], values,
            width=bar_width,
            color=SYSTEM_COLORS[sys],
            edgecolor="white", linewidth=0.6,
            alpha=0.92, zorder=3,
            label=SYSTEM_LABELS[sys]
        )
        for bar, val in zip(bars, values):
            if val > 0.02:
                ax.text(bar.get_x() + bar.get_width() / 2,
                        bar.get_height() + 0.012,
                        f"{val:.3f}",
                        ha="center", va="bottom",
                        fontsize=7.5, fontweight="bold", color="#333333")

    ax.set_ylabel("RAGAS Score", fontsize=11, fontweight="bold", labelpad=8)
    ax.set_title("Overall RAGAS Performance — 5 System Comparison",
                 fontsize=13, fontweight="bold", pad=15, color="#1A1A2E")
    ax.set_xticks(x)
    ax.set_xticklabels(METRIC_LABELS, fontsize=11, fontweight="bold")
    ax.set_ylim(0, 1.15)
    ax.grid(axis="y", linestyle="--", alpha=0.5, zorder=0)
    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)
    ax.legend(loc="upper right", frameon=True,
              facecolor="#FFFFFF", edgecolor="#E0E0E0", fontsize=9)

    fig.savefig(CHARTS_DIR / "overall_ragas_comparison.png", dpi=200, bbox_inches="tight")
    fig.savefig(CHARTS_DIR / "overall_ragas_comparison.pdf", bbox_inches="tight")
    plt.close(fig)
    print("Saved Chart 1: overall_ragas_comparison (PNG & PDF)")


# ── Chart 2: By Difficulty — 5 systems ────────────────────────────────────
def plot_difficulty_ragas_comparison(difficulty_df):
    """2×2 subplots (one per metric) — 5 systems per difficulty tier."""
    difficulties = ["easy", "medium", "hard"]
    diff_labels  = ["Easy", "Medium", "Hard"]

    n_sys = len(ALL_SYSTEMS)
    bar_width = 0.13
    x = np.arange(len(difficulties))
    offsets = np.linspace(-(n_sys - 1) / 2 * bar_width,
                           (n_sys - 1) / 2 * bar_width, n_sys)

    fig, axes = plt.subplots(2, 2, figsize=(16, 10))
    fig.patch.set_facecolor("#F8F9FA")

    for m_idx, (metric, label) in enumerate(zip(RAGAS_METRICS, METRIC_LABELS)):
        ax = axes.flatten()[m_idx]
        ax.set_facecolor("#FFFFFF")

        for s_idx, sys in enumerate(ALL_SYSTEMS):
            values = [_get_val(difficulty_df, sys, metric, d) for d in difficulties]
            bars = ax.bar(
                x + offsets[s_idx], values,
                width=bar_width,
                color=SYSTEM_COLORS[sys],
                edgecolor="white", linewidth=0.5,
                alpha=0.92, zorder=3,
                label=SYSTEM_LABELS[sys]
            )
            for bar, val in zip(bars, values):
                if val > 0.03:
                    ax.text(bar.get_x() + bar.get_width() / 2,
                            bar.get_height() + 0.01,
                            f"{val:.2f}",
                            ha="center", va="bottom",
                            fontsize=6.5, fontweight="bold", color="#333333")

        ax.set_xticks(x)
        ax.set_xticklabels(diff_labels, fontsize=10, fontweight="bold")
        ax.set_ylim(0, 1.2)
        ax.set_ylabel("Score", fontsize=9)
        ax.set_title(label, fontsize=12, fontweight="bold", pad=8, color="#1A1A2E")
        ax.yaxis.grid(True, linestyle="--", alpha=0.5, zorder=0)
        ax.set_axisbelow(True)
        for spine in ["top", "right"]:
            ax.spines[spine].set_visible(False)

    legend_handles = [mpatches.Patch(color=SYSTEM_COLORS[s], label=SYSTEM_LABELS[s])
                      for s in ALL_SYSTEMS]
    fig.legend(handles=legend_handles, loc="lower center",
               ncol=5, fontsize=10, frameon=True,
               edgecolor="#CCCCCC", bbox_to_anchor=(0.5, 0.01))

    fig.suptitle("RAGAS Performance by Difficulty Tier — 5 Systems",
                 fontsize=15, fontweight="bold", y=0.98, color="#1A1A2E")
    plt.tight_layout(rect=[0, 0.06, 1, 0.96])

    fig.savefig(CHARTS_DIR / "difficulty_ragas_5systems.png", dpi=200, bbox_inches="tight")
    fig.savefig(CHARTS_DIR / "difficulty_ragas_5systems.pdf", bbox_inches="tight")
    plt.close(fig)
    print("Saved Chart 2: difficulty_ragas_5systems (PNG & PDF)")


# ── Chart 3: Faithfulness & Answer Relevancy — 5 systems ──────────────────
def plot_answer_level_baselines(overall_df):
    """Faithfulness + Answer Relevancy for all 5 systems."""
    metrics       = ["faithfulness", "answer_relevancy"]
    metric_labels = ["Faithfulness", "Answer Relevancy"]

    n_sys = len(ALL_SYSTEMS)
    bar_width = 0.15
    x = np.arange(len(metrics))
    offsets = np.linspace(-(n_sys - 1) / 2 * bar_width,
                           (n_sys - 1) / 2 * bar_width, n_sys)

    fig, ax = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor("#F8F9FA")
    ax.set_facecolor("#FFFFFF")

    for idx, sys in enumerate(ALL_SYSTEMS):
        values = [_get_val(overall_df, sys, m) for m in metrics]
        bars = ax.bar(
            x + offsets[idx], values,
            width=bar_width,
            color=SYSTEM_COLORS[sys],
            edgecolor="white", linewidth=0.6,
            alpha=0.92, zorder=3,
            label=SYSTEM_LABELS[sys]
        )
        for bar, val in zip(bars, values):
            if val > 0.02:
                ax.text(bar.get_x() + bar.get_width() / 2,
                        bar.get_height() + 0.012,
                        f"{val:.3f}",
                        ha="center", va="bottom",
                        fontsize=8, fontweight="bold", color="#333333")

    ax.set_ylabel("RAGAS Score", fontsize=11, fontweight="bold", labelpad=8)
    ax.set_title("Faithfulness & Answer Relevancy — 5 System Comparison",
                 fontsize=13, fontweight="bold", pad=15, color="#1A1A2E")
    ax.set_xticks(x)
    ax.set_xticklabels(metric_labels, fontsize=11, fontweight="bold")
    ax.set_ylim(0, 1.1)
    ax.grid(axis="y", linestyle="--", alpha=0.5, zorder=0)
    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)
    ax.legend(loc="upper left", frameon=True,
              facecolor="#FFFFFF", edgecolor="#E0E0E0", fontsize=9)

    fig.savefig(CHARTS_DIR / "answer_level_baselines.png", dpi=200, bbox_inches="tight")
    fig.savefig(CHARTS_DIR / "answer_level_baselines.pdf", bbox_inches="tight")
    plt.close(fig)
    print("Saved Chart 3: answer_level_baselines (PNG & PDF)")


# ── Chart 4: Context Precision & Recall — 5 systems ───────────────────────
def plot_context_metrics(overall_df):
    """Context Precision + Context Recall for all 5 systems."""
    metrics       = ["context_precision", "context_recall"]
    metric_labels = ["Context Precision", "Context Recall"]

    n_sys = len(ALL_SYSTEMS)
    bar_width = 0.15
    x = np.arange(len(metrics))
    offsets = np.linspace(-(n_sys - 1) / 2 * bar_width,
                           (n_sys - 1) / 2 * bar_width, n_sys)

    fig, ax = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor("#F8F9FA")
    ax.set_facecolor("#FFFFFF")

    for idx, sys in enumerate(ALL_SYSTEMS):
        values = [_get_val(overall_df, sys, m) for m in metrics]
        bars = ax.bar(
            x + offsets[idx], values,
            width=bar_width,
            color=SYSTEM_COLORS[sys],
            edgecolor="white", linewidth=0.6,
            alpha=0.92, zorder=3,
            label=SYSTEM_LABELS[sys]
        )
        for bar, val in zip(bars, values):
            if val > 0.02:
                ax.text(bar.get_x() + bar.get_width() / 2,
                        bar.get_height() + 0.012,
                        f"{val:.3f}",
                        ha="center", va="bottom",
                        fontsize=8, fontweight="bold", color="#333333")

    ax.set_ylabel("RAGAS Score", fontsize=11, fontweight="bold", labelpad=8)
    ax.set_title("Context Precision & Recall — 5 System Comparison",
                 fontsize=13, fontweight="bold", pad=15, color="#1A1A2E")
    ax.set_xticks(x)
    ax.set_xticklabels(metric_labels, fontsize=11, fontweight="bold")
    ax.set_ylim(0, 1.1)
    ax.grid(axis="y", linestyle="--", alpha=0.5, zorder=0)
    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)
    ax.legend(loc="upper right", frameon=True,
              facecolor="#FFFFFF", edgecolor="#E0E0E0", fontsize=9)

    fig.savefig(CHARTS_DIR / "context_metrics_rag_systems.png", dpi=200, bbox_inches="tight")
    fig.savefig(CHARTS_DIR / "context_metrics_rag_systems.pdf", bbox_inches="tight")
    plt.close(fig)
    print("Saved Chart 4: context_metrics_rag_systems (PNG & PDF)")


# ── main ────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("GENERATING RAGAS PERFORMANCE COMPARISON CHARTS (5 Systems)")
    print("=" * 60)

    overall_df, difficulty_df = load_data()

    plot_overall_ragas_comparison(overall_df)
    plot_difficulty_ragas_comparison(difficulty_df)
    plot_answer_level_baselines(overall_df)
    plot_context_metrics(overall_df)

    print("\nAll charts generated successfully in results/charts/")
    print("=" * 60)

if __name__ == "__main__":
    main()
