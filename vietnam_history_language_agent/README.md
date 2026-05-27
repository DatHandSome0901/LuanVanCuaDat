# VietnamHistoryLanguageAgent

`VietnamHistoryLanguageAgent` is a deterministic post-processing module for Vietnamese history answers.

It does not add new historical claims. It detects Vietnamese history context and rewrites internationalized or awkward English-style terms into wording that is natural for Vietnamese users.

## Pipeline

Input:

- `userQuestion`
- `rawAnswer`

Process:

1. Detect whether the question/answer is related to Vietnamese history.
2. If not related, return `rawAnswer`.
3. If related, collect matched topics, apply Vietnamese wording policy, rewrite known terms, and return `finalAnswer`.

Output object:

- `isVietnamHistoryTopic`
- `matchedTopics`
- `appliedRules`
- `originalAnswer`
- `finalAnswer`

## Usage

```python
from vietnam_history_language_agent import VietnamHistoryLanguageAgent

agent = VietnamHistoryLanguageAgent()
result = agent.process(
    userQuestion="Fall of Saigon là gì?",
    rawAnswer="Fall of Saigon is an international name for events on April 30, 1975.",
)

print(result.finalAnswer)
print(result.to_dict())
```

## Demo

Run from the project root:

```bash
python -m vietnam_history_language_agent.examples
```

On Windows with the local virtual environment:

```powershell
.\venv\Scripts\python.exe -m vietnam_history_language_agent.examples
```
