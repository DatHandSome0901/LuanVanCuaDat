import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from chatbot.services.query_classifier import classify_query, get_weights
from chatbot.services.causal_engine import causal_score, temporal_score

print('=== QUERY CLASSIFIER (diacritics) ===')
tests_viet = [
    'Tại sao nhà Trần thắng quân Mông Cổ?',
    'Vì sao chiến tranh xảy ra?',
    'Khi nào nhà Lý thành lập?',
    'So sánh nhà Trần và nhà Lý',
    'Ai là vua đầu tiên?',
    'Nguyên nhân dẫn đến sự sụp đổ của nhà Hồ?',
]
for q in tests_viet:
    got = classify_query(q)
    print(f'  [{got}] {q}')

print()
print('=== CAUSAL SCORE ===')
s1 = causal_score(
    'tại sao nhà Trần thắng',
    'Nhà Trần thắng vì chiến thuật hợp lý dẫn đến chiến thắng vang dội. Do đó quân Mông Cổ rút lui.'
)
s2 = causal_score('ai là vua', 'Hùng Vương là vị vua đầu tiên của Việt Nam.')
print(f'  causal high (expect > 0.5): {s1}')
print(f'  causal low  (expect < 0.2): {s2}')

print()
print('=== TEMPORAL SCORE ===')
t1 = temporal_score('năm 1258 quân Mông Cổ', 'cuộc kháng chiến năm 1258 kết thúc thắng lợi.')
t2 = temporal_score('nhà Trần năm 1285', 'nhà Lý thành lập năm 1009.')
print(f'  same year 1258 (expect 1.0): {t1}')
print(f'  far year 276y  (expect ~0.15): {t2}')

print()
print('ALL OK')
