# Empirical Evaluation Tables — 100-Question Vietnamese Feudal History Benchmark

This document presents the detailed empirical evaluation tables comparing the **TALRAG** system against **ItihashQA Baseline**, **NotebookLM**, **Gemini Gems**, and **ChatGPT (Custom GPT)**.

## Table 1. Baseline Systems Used in the Study

| System | Type | Description | API/Interface | Access |
| :--- | :--- | :--- | :--- | :--- |
| **TALRAG** | Agentic RAG | Proposed framework with adaptive, temporal/causal logic | Programmatic (LangGraph) | Open-source (local) |
| **ItihashQA Baseline** | Static RAG | Standard FAISS similarity search + LLM generation | Programmatic (FAISS) | Open-source (local) |
| **Gemini Gems** | Custom Agent | Instruction-tuned custom agent on Google Gemini | Web UI | Closed |
| **ChatGPT (Custom GPT)** | Custom GPT | Custom GPT-4o with uploaded corpus and instructions | Web UI | Closed |
| **NotebookLM** | Research Assistant | Google's document-anchored workspace research agent | Web UI | Closed |


## Table 2. Benchmark Construction Criteria

| Difficulty | Question Count | Historical Era Coverage | Dynasty Focus | Question Types |
| :--- | :---: | :--- | :--- | :--- |
| **Easy** | 40 | 939 - 1945 | Ngô, Đinh, Tiền Lê, Lý, Trần, Hồ, Lê, Tây Sơn, Nguyễn | Factual lookups, dates, entities |
| **Medium** | 35 | 939 - 1945 | Ngô, Đinh, Tiền Lê, Lý, Trần, Hồ, Lê, Tây Sơn, Nguyễn | Explanatory, causal reasons, roles |
| **Hard** | 25 | 939 - 1945 | Cross-dynastic synthesis | Multi-dynasty comparison, synthesis |
| **Total** | **100** | **939 - 1945** | **All Feudal Dynasties** | **Balanced Factual & Explanatory** |


## Table 3. Overall RAGAS Results (Average across 100 Questions)

| System | Faithfulness | Answer Relevancy | Context Precision | Context Recall | Avg Latency |
| :--- | :---: | :---: | :---: | :---: | :---: |
| TALRAG | 0.4009 | 0.4480 | 0.1972 | 0.1433 | 24.57s |
| ItihashQA Baseline | 0.4464 | 0.1562 | 0.1769 | 0.2150 | 4.90s |
| NOTEBOOKLM | 0.2784 | 0.1571 | 0.1841 | 0.2117 | 0.00s |
| GEMINI_GEMS | 0.5316 | 0.7685 | 0.1656 | 0.1967 | 0.00s |
| Custom GPT | 0.3153 | 0.8642 | 0.1683 | 0.2300 | 0.00s |


## Table 4. RAGAS Results by Difficulty Tier

| Difficulty | System | Faithfulness | Answer Relevancy | Context Precision | Context Recall | Avg Latency |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| Easy | TALRAG | 0.3329 | 0.5638 | 0.0909 | 0.0500 | 27.67s |
| Easy | ItihashQA Baseline | 0.2125 | 0.0227 | 0.0083 | 0.0250 | 3.93s |
| Easy | NOTEBOOKLM | 0.0625 | 0.0229 | 0.0000 | 0.0250 | 0.00s |
| Easy | GEMINI_GEMS | 0.3964 | 0.7875 | 0.0083 | 0.0000 | 0.00s |
| Easy | Custom GPT | 0.1159 | 0.8543 | 0.0083 | 0.0000 | 0.00s |
| Medium | TALRAG | 0.4030 | 0.5670 | 0.1925 | 0.1714 | 24.76s |
| Medium | ItihashQA Baseline | 0.5290 | 0.2997 | 0.3555 | 0.4000 | 5.33s |
| Medium | NOTEBOOKLM | 0.4491 | 0.2987 | 0.3762 | 0.4571 | 0.00s |
| Medium | GEMINI_GEMS | 0.6256 | 0.8055 | 0.3476 | 0.4286 | 0.00s |
| Medium | Custom GPT | 0.4619 | 0.8680 | 0.3248 | 0.5143 | 0.00s |
| Hard | TALRAG | 0.5066 | 0.0962 | 0.3738 | 0.2533 | 19.36s |
| Hard | ItihashQA Baseline | 0.7048 | 0.1688 | 0.1964 | 0.2600 | 5.85s |
| Hard | NOTEBOOKLM | 0.3847 | 0.1734 | 0.2096 | 0.1667 | 0.00s |
| Hard | GEMINI_GEMS | 0.6239 | 0.6792 | 0.1626 | 0.1867 | 0.00s |
| Hard | Custom GPT | 0.4290 | 0.8747 | 0.2053 | 0.2000 | 0.00s |


## Table 5. Answer-level Performance and Relevancy Improvements

| System | Faithfulness | Answer Relevancy | Improvement (Relevancy) |
| :--- | :---: | :---: | :---: |
| TALRAG | 0.4009 | 0.4480 | +186.9% |
| ItihashQA Baseline | 0.4464 | 0.1562 | Baseline |
| NOTEBOOKLM | 0.2784 | 0.1571 | N/A |
| GEMINI_GEMS | 0.5316 | 0.7685 | N/A |
| Custom GPT | 0.3153 | 0.8642 | N/A |

