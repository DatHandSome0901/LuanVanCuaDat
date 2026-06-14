from __future__ import annotations

import html
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "figures"
OUT_DIR.mkdir(parents=True, exist_ok=True)

SVG_PATH = OUT_DIR / "hinh_3_5_pipeline_talrag_web_learning.svg"
PNG_PATH = OUT_DIR / "hinh_3_5_pipeline_talrag_web_learning.png"

WIDTH = 1600
HEIGHT = 2760
TOP_CUT = 90
OUTPUT_HEIGHT = HEIGHT - TOP_CUT
SCALE = 2


COLORS = {
    "bg": "#fbfdff",
    "grid": "#eef2f7",
    "ink": "#0f172a",
    "muted": "#475569",
    "blue_fill": "#eaf3ff",
    "blue_stroke": "#2563eb",
    "green_fill": "#eaf8ef",
    "green_stroke": "#16a34a",
    "orange_fill": "#fff4df",
    "orange_stroke": "#f59e0b",
    "red_fill": "#feeeee",
    "red_stroke": "#ef4444",
    "purple_fill": "#f3e8ff",
    "purple_stroke": "#8b5cf6",
    "teal_fill": "#ecfeff",
    "teal_stroke": "#0891b2",
    "gray_fill": "#f8fafc",
    "gray_stroke": "#64748b",
}


def font_path(name: str) -> str | None:
    candidates = [
        Path(r"C:\Windows\Fonts") / name,
        Path(r"C:\Windows\Fonts") / name.lower(),
        Path(r"C:\Windows\Fonts") / name.upper(),
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    return None


def make_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    path = font_path("arialbd.ttf" if bold else "arial.ttf")
    if path:
        return ImageFont.truetype(path, size * SCALE)
    return ImageFont.load_default()


TITLE_FONT = make_font(36, True)
SUBTITLE_FONT = make_font(18, False)
NODE_TITLE_FONT = make_font(22, True)
NODE_TEXT_FONT = make_font(17, False)
SMALL_FONT = make_font(14, False)
STEP_FONT = make_font(17, True)
LABEL_FONT = make_font(15, True)


def sx(value: float) -> int:
    return int(round(value * SCALE))


def sy(value: float) -> float:
    return value - TOP_CUT


def shifted(points: list[tuple[float, float]]) -> list[tuple[float, float]]:
    return [(x, sy(y)) for x, y in points]


def hex_to_rgb(color: str) -> tuple[int, int, int]:
    color = color.lstrip("#")
    return tuple(int(color[i : i + 2], 16) for i in (0, 2, 4))


def draw_centered_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[float, float],
    text: str,
    font: ImageFont.ImageFont,
    fill: str,
) -> None:
    x, y = xy
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((sx(x) - tw // 2, sx(y) - th // 2), text, font=font, fill=fill)


def draw_line_text(
    draw: ImageDraw.ImageDraw,
    x: float,
    y: float,
    text: str,
    font: ImageFont.ImageFont,
    fill: str,
) -> None:
    draw.text((sx(x), sx(y)), text, font=font, fill=fill)


def draw_shadowed_round_rect(
    base: Image.Image,
    box: tuple[float, float, float, float],
    radius: int,
    fill: str,
    outline: str,
    width: int = 3,
) -> None:
    x, y, w, h = box
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(
        [sx(x + 6), sx(y + 8), sx(x + w + 6), sx(y + h + 8)],
        radius=sx(radius),
        fill=(15, 23, 42, 30),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(sx(7)))
    base.alpha_composite(shadow)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(
        [sx(x), sx(y), sx(x + w), sx(y + h)],
        radius=sx(radius),
        fill=fill,
        outline=outline,
        width=sx(width),
    )


def draw_node(
    base: Image.Image,
    x: float,
    y: float,
    w: float,
    h: float,
    step: str,
    title: str,
    lines: list[str],
    fill: str,
    stroke: str,
) -> None:
    draw_shadowed_round_rect(base, (x, y, w, h), 18, fill, stroke)
    draw = ImageDraw.Draw(base)

    cx = x + 31
    cy = y + 31
    draw.ellipse(
        [sx(cx - 18), sx(cy - 18), sx(cx + 18), sx(cy + 18)],
        fill=stroke,
        outline="white",
        width=sx(3),
    )
    draw_centered_text(draw, (cx, cy), step, STEP_FONT, "white")
    draw_line_text(draw, x + 64, y + 18, title, NODE_TITLE_FONT, COLORS["ink"])
    yy = y + 52
    for line in lines:
        draw_line_text(draw, x + 64, yy, line, NODE_TEXT_FONT, COLORS["muted"])
        yy += 25


def draw_diamond(
    base: Image.Image,
    cx: float,
    cy: float,
    w: float,
    h: float,
    step: str,
    title: str,
    lines: list[str],
    fill: str,
    stroke: str,
) -> None:
    points = [(cx, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2), (cx - w / 2, cy)]

    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.polygon([(sx(px + 6), sx(py + 8)) for px, py in points], fill=(15, 23, 42, 28))
    shadow = shadow.filter(ImageFilter.GaussianBlur(sx(7)))
    base.alpha_composite(shadow)

    draw = ImageDraw.Draw(base)
    draw.polygon([(sx(px), sx(py)) for px, py in points], fill=fill, outline=stroke)
    draw.line([(sx(px), sx(py)) for px, py in points + [points[0]]], fill=stroke, width=sx(3))

    draw.ellipse(
        [sx(cx - 18), sx(cy - h / 2 + 15), sx(cx + 18), sx(cy - h / 2 + 51)],
        fill=stroke,
        outline="white",
        width=sx(3),
    )
    draw_centered_text(draw, (cx, cy - h / 2 + 33), step, STEP_FONT, "white")
    draw_centered_text(draw, (cx, cy - 8), title, NODE_TITLE_FONT, COLORS["ink"])
    offset = 22
    for line in lines:
        draw_centered_text(draw, (cx, cy + offset), line, NODE_TEXT_FONT, COLORS["muted"])
        offset += 25


def arrow_head_points(start: tuple[float, float], end: tuple[float, float], size: float = 15) -> list[tuple[float, float]]:
    x1, y1 = start
    x2, y2 = end
    angle = math.atan2(y2 - y1, x2 - x1)
    left = angle + math.pi - 0.48
    right = angle + math.pi + 0.48
    return [
        (x2, y2),
        (x2 + math.cos(left) * size, y2 + math.sin(left) * size),
        (x2 + math.cos(right) * size, y2 + math.sin(right) * size),
    ]


def draw_dashed_segment(
    draw: ImageDraw.ImageDraw,
    p1: tuple[float, float],
    p2: tuple[float, float],
    color: str,
    width: int,
    dash: float = 12,
    gap: float = 9,
) -> None:
    x1, y1 = p1
    x2, y2 = p2
    length = math.hypot(x2 - x1, y2 - y1)
    if length == 0:
        return
    dx = (x2 - x1) / length
    dy = (y2 - y1) / length
    pos = 0.0
    while pos < length:
        end = min(pos + dash, length)
        draw.line(
            [(sx(x1 + dx * pos), sx(y1 + dy * pos)), (sx(x1 + dx * end), sx(y1 + dy * end))],
            fill=color,
            width=sx(width),
        )
        pos += dash + gap


def draw_arrow(
    base: Image.Image,
    points: list[tuple[float, float]],
    color: str = COLORS["gray_stroke"],
    width: int = 4,
    dashed: bool = False,
) -> None:
    draw = ImageDraw.Draw(base)
    for p1, p2 in zip(points, points[1:]):
        if dashed:
            draw_dashed_segment(draw, p1, p2, color, width)
        else:
            draw.line([(sx(p1[0]), sx(p1[1])), (sx(p2[0]), sx(p2[1]))], fill=color, width=sx(width))
    if len(points) >= 2:
        head = arrow_head_points(points[-2], points[-1])
        draw.polygon([(sx(x), sx(y)) for x, y in head], fill=color)


def draw_label(base: Image.Image, x: float, y: float, text: str, color: str) -> None:
    draw = ImageDraw.Draw(base)
    bbox = draw.textbbox((0, 0), text, font=LABEL_FONT)
    pad_x = 10 * SCALE
    pad_y = 5 * SCALE
    rect = [sx(x) - (bbox[2] - bbox[0]) // 2 - pad_x, sx(y) - pad_y, sx(x) + (bbox[2] - bbox[0]) // 2 + pad_x, sx(y) + (bbox[3] - bbox[1]) + pad_y]
    draw.rounded_rectangle(rect, radius=sx(10), fill="white", outline=color, width=sx(2))
    draw.text((rect[0] + pad_x, rect[1] + pad_y - sx(1)), text, font=LABEL_FONT, fill=color)


NODES = [
    ("node", 560, 120, 480, 88, "1", "Câu hỏi người dùng", ["ChatView gửi SSE /api/v1/chat/stream", "hoặc REST /api/v1/chat"], "blue"),
    ("node", 500, 240, 600, 112, "2", "FastAPI Chat Router", ["JWT, số dư token, conversation_id", "lấy 6 tin nhắn gần nhất từ SQLite"], "blue"),
    ("node", 500, 390, 600, 112, "3", "Chuẩn hóa ngữ cảnh", ["dịch EN→VI nếu cần, xử lý follow-up", "normalize_question + language policy"], "purple"),
    ("node", 500, 540, 600, 112, "4", "Semantic Cache Lookup", ["so cosine embedding theo tenant/kb/user", "cache hit: trả lời nhanh, vẫn trừ token"], "teal"),
    ("node", 85, 585, 360, 112, "5", "Cache hit", ["dùng answer/sources đã lưu", "dịch lại nếu người dùng hỏi tiếng Anh"], "green"),
    ("node", 500, 690, 600, 112, "6", "LangGraph Workflow", ["START → retrieve → grade_documents", "generate hoặc handle_no_answer"], "blue"),
    ("node", 500, 840, 600, 140, "7", "Retrieve: phân loại + entity", ["pending_knowledge chưa duyệt được ưu tiên", "classify factual/temporal/causal/comparison", "detect entity, intent chi tiết, năm/triều đại"], "blue"),
    ("node", 500, 1030, 600, 170, "8", "Truy xuất FAISS đa nguồn", ["User RAG riêng: user_rag_{id}/{embedding}", "Global History + approved knowledge", "output/{vertex|openai}; legacy OpenAI tùy cấu hình"], "green"),
    ("node", 85, 920, 360, 115, "A", "Tri thức cá nhân", ["người dùng lưu ghi chú/đính chính", "sync_user_vector_store rebuild FAISS"], "green"),
    ("node", 85, 1065, 360, 115, "B", "Nạp dữ liệu offline", ["PDF / DOCX / TXT → chunk", "embedding OpenAI/Vertex/Local → FAISS"], "green"),
    ("node", 85, 1210, 360, 115, "C", "Global History Index", ["crawl nguồn lịch sử tin cậy", "lưu global_history/{embedding}"], "green"),
    ("node", 500, 1240, 600, 125, "9", "Adaptive Re-ranking", ["final = α.semantic + β.temporal + γ.causal", "entity-aware bonus/penalty; ưu tiên User RAG"], "orange"),
    ("node", 500, 1395, 600, 125, "10", "Grade & Filter Documents", ["fast keyword/entity filter mặc định", "tùy chọn LLM DocumentGrader"], "orange"),
    ("diamond", 800, 1575, 420, 130, "11", "Đủ tài liệu phù hợp?", ["sau lọc tài liệu"], "orange"),
    ("node", 120, 1690, 560, 120, "12", "Sinh câu trả lời RAG", ["AnswerGenerator inject context + history", "LLM: OpenAI / Gemini / Vertex / Ollama"], "green"),
    ("node", 120, 1845, 560, 120, "13", "Kiểm soát chất lượng", ["strip source refs, remap citations [i]", "VietnamHistoryLanguageAgent + guardrail tùy chọn"], "green"),
    ("node", 120, 2000, 560, 130, "14", "Lưu và trả về", ["save messages, chat_logs, sources", "save semantic_cache nếu là RAG chuẩn", "trừ token, sinh câu hỏi gợi ý, stream SSE"], "green"),
    ("node", 920, 1690, 560, 120, "15", "Web Learning Agent", ["khi thiếu tài liệu hoặc câu trả lời từ chối", "có thể chạy job nền và frontend polling"], "orange"),
    ("node", 920, 1845, 560, 135, "16", "Tìm kiếm & crawl nguồn", ["DDGS ưu tiên .gov.vn, bảo tàng, báo nhà nước", "Trafilatura/BS4, chunk, lọc spam/keyword"], "orange"),
    ("node", 920, 2010, 560, 125, "17", "LLM Verification", ["chọn chunk liên quan, kiểm tra mâu thuẫn", "chỉ trả lời nếu có bằng chứng đủ tin cậy"], "orange"),
    ("diamond", 1200, 2210, 420, 130, "18", "Web đủ tin cậy?", ["reliability + relevance"], "orange"),
    ("node", 700, 2340, 470, 125, "19", "pending_knowledge", ["lưu câu hỏi/câu trả lời chờ duyệt", "trả lời kèm nhãn đang tự học từ Web"], "orange"),
    ("node", 700, 2500, 470, 125, "20", "Feedback / Admin / Auto Learning", ["admin approve hoặc >=5 lượt like", "ingest vào FAISS, clear cache, kb_version++"], "green"),
    ("node", 1200, 2340, 330, 125, "X", "Không đủ chứng cứ", ["không lưu tri thức", "trả lời thiếu dữ liệu"], "red"),
    ("node", 500, 2640, 600, 92, "21", "Frontend hiển thị kết quả", ["answer + sources + related questions", "người dùng like/dislike hoặc lưu tri thức cá nhân"], "blue"),
]


ARROWS = [
    ([(800, 208), (800, 240)], "gray", False),
    ([(800, 352), (800, 390)], "gray", False),
    ([(800, 502), (800, 540)], "gray", False),
    ([(800, 652), (800, 690)], "gray", False),
    ([(500, 596), (445, 596)], "green", True),
    ([(265, 697), (265, 2065), (120, 2065)], "green", True),
    ([(800, 802), (800, 840)], "gray", False),
    ([(800, 980), (800, 1030)], "gray", False),
    ([(445, 978), (500, 1080)], "green", False),
    ([(445, 1123), (500, 1123)], "green", False),
    ([(445, 1268), (500, 1168)], "green", False),
    ([(800, 1200), (800, 1240)], "gray", False),
    ([(800, 1365), (800, 1395)], "gray", False),
    ([(800, 1520), (800, 1510)], "gray", False),
    ([(590, 1575), (400, 1575), (400, 1690)], "green", False),
    ([(1010, 1575), (1200, 1575), (1200, 1690)], "orange", False),
    ([(400, 1810), (400, 1845)], "green", False),
    ([(400, 1965), (400, 2000)], "green", False),
    ([(400, 2130), (400, 2686), (500, 2686)], "green", False),
    ([(1200, 1810), (1200, 1845)], "orange", False),
    ([(1200, 1980), (1200, 2010)], "orange", False),
    ([(1200, 2135), (1200, 2145)], "orange", False),
    ([(990, 2210), (935, 2210), (935, 2340)], "orange", False),
    ([(1410, 2210), (1365, 2210), (1365, 2340)], "red", False),
    ([(935, 2465), (935, 2500)], "green", False),
    ([(935, 2625), (935, 2686), (1100, 2686)], "green", False),
    ([(1365, 2465), (1365, 2686), (1100, 2686)], "red", False),
    ([(935, 2500), (1530, 2500), (1530, 1120), (1100, 1120)], "green", True),
]


LABELS = [
    (585, 1550, "Yes: có tri thức nội bộ", COLORS["green_stroke"]),
    (1015, 1550, "No: thiếu dữ liệu", COLORS["orange_stroke"]),
    (962, 2285, "Reliable", COLORS["green_stroke"]),
    (1380, 2285, "Unreliable", COLORS["red_stroke"]),
    (1360, 1100, "FAISS được cập nhật cho câu hỏi sau", COLORS["green_stroke"]),
]


def color_pair(kind: str) -> tuple[str, str]:
    return COLORS[f"{kind}_fill"], COLORS[f"{kind}_stroke"]


def render_png() -> None:
    image = Image.new("RGBA", (WIDTH * SCALE, OUTPUT_HEIGHT * SCALE), COLORS["bg"])
    draw = ImageDraw.Draw(image)

    for x in range(0, WIDTH, 80):
        draw.line([(sx(x), 0), (sx(x), sx(OUTPUT_HEIGHT))], fill=COLORS["grid"], width=sx(1))
    for y in range(0, OUTPUT_HEIGHT, 80):
        draw.line([(0, sx(y)), (sx(WIDTH), sx(y))], fill=COLORS["grid"], width=sx(1))

    for points, kind, dashed in ARROWS:
        color = COLORS[f"{kind}_stroke"] if f"{kind}_stroke" in COLORS else COLORS["gray_stroke"]
        draw_arrow(image, shifted(points), color=color, width=4, dashed=dashed)

    for item in NODES:
        if item[0] == "node":
            _, x, y, w, h, step, title, lines, kind = item
            fill, stroke = color_pair(kind)
            draw_node(image, x, sy(y), w, h, step, title, lines, fill, stroke)
        else:
            _, cx, cy, w, h, step, title, lines, kind = item
            fill, stroke = color_pair(kind)
            draw_diamond(image, cx, sy(cy), w, h, step, title, lines, fill, stroke)

    for x, y, text, color in LABELS:
        draw_label(image, x, sy(y), text, color)

    footer = "Code tham chiếu: app/routers/chatbot.py | chatbot/services/files_rag_chat_agent.py | web_learning_agent.py | auto_learning_agent.py | ingestion/retriever.py"
    draw_centered_text(draw, (WIDTH / 2, sy(2745)), footer, SMALL_FONT, COLORS["muted"])

    image = image.convert("RGB").resize((WIDTH, OUTPUT_HEIGHT), Image.Resampling.LANCZOS)
    image.save(PNG_PATH, quality=95)


def svg_text(x: float, y: float, text: str, cls: str, anchor: str = "start") -> str:
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" class="{cls}">{html.escape(text)}</text>'


def svg_node(x: float, y: float, w: float, h: float, step: str, title: str, lines: list[str], kind: str) -> str:
    fill, stroke = color_pair(kind)
    parts = [
        f'<g filter="url(#shadow)">',
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fill}" stroke="{stroke}" stroke-width="3"/>',
        f'<circle cx="{x + 31}" cy="{y + 31}" r="18" fill="{stroke}" stroke="#fff" stroke-width="3"/>',
        svg_text(x + 31, y + 37, step, "step", "middle"),
        svg_text(x + 64, y + 42, title, "node-title"),
    ]
    yy = y + 78
    for line in lines:
        parts.append(svg_text(x + 64, yy, line, "node-text"))
        yy += 25
    parts.append("</g>")
    return "\n".join(parts)


def svg_diamond(cx: float, cy: float, w: float, h: float, step: str, title: str, lines: list[str], kind: str) -> str:
    fill, stroke = color_pair(kind)
    points = f"{cx},{cy - h / 2} {cx + w / 2},{cy} {cx},{cy + h / 2} {cx - w / 2},{cy}"
    parts = [
        '<g filter="url(#shadow)">',
        f'<polygon points="{points}" fill="{fill}" stroke="{stroke}" stroke-width="3"/>',
        f'<circle cx="{cx}" cy="{cy - h / 2 + 33}" r="18" fill="{stroke}" stroke="#fff" stroke-width="3"/>',
        svg_text(cx, cy - h / 2 + 39, step, "step", "middle"),
        svg_text(cx, cy - 2, title, "node-title-mid", "middle"),
    ]
    yy = cy + 26
    for line in lines:
        parts.append(svg_text(cx, yy, line, "node-text-mid", "middle"))
        yy += 25
    parts.append("</g>")
    return "\n".join(parts)


def svg_arrow(points: list[tuple[float, float]], kind: str, dashed: bool) -> str:
    color = COLORS[f"{kind}_stroke"] if f"{kind}_stroke" in COLORS else COLORS["gray_stroke"]
    d = "M " + " L ".join(f"{x} {y}" for x, y in points)
    dash = ' stroke-dasharray="12 9"' if dashed else ""
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="4" marker-end="url(#{kind}Arrow)"{dash}/>'


def render_svg() -> None:
    body: list[str] = []
    for x in range(0, WIDTH, 80):
        body.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{OUTPUT_HEIGHT}" class="grid"/>')
    for y in range(0, OUTPUT_HEIGHT, 80):
        body.append(f'<line x1="0" y1="{y}" x2="{WIDTH}" y2="{y}" class="grid"/>')

    for points, kind, dashed in ARROWS:
        body.append(svg_arrow(shifted(points), kind, dashed))

    for item in NODES:
        if item[0] == "node":
            _, x, y, w, h, step, title, lines, kind = item
            body.append(svg_node(x, sy(y), w, h, step, title, lines, kind))
        else:
            _, cx, cy, w, h, step, title, lines, kind = item
            body.append(svg_diamond(cx, sy(cy), w, h, step, title, lines, kind))

    for x, y, text, color in LABELS:
        tw = max(120, len(text) * 8)
        body.append(f'<rect x="{x - tw / 2}" y="{sy(y) - 17}" width="{tw}" height="28" rx="10" fill="#fff" stroke="{color}" stroke-width="2"/>')
        body.append(svg_text(x, sy(y) + 3, text, "label", "middle"))

    footer = "Code tham chiếu: app/routers/chatbot.py | chatbot/services/files_rag_chat_agent.py | web_learning_agent.py | auto_learning_agent.py | ingestion/retriever.py"
    body.append(svg_text(WIDTH / 2, sy(2748), footer, "small", "middle"))

    defs = f"""
  <defs>
    <style>
      .title {{ font: 700 36px Arial, sans-serif; fill: {COLORS['ink']}; letter-spacing: 0; }}
      .subtitle {{ font: 400 18px Arial, sans-serif; fill: {COLORS['muted']}; letter-spacing: 0; }}
      .node-title {{ font: 700 22px Arial, sans-serif; fill: {COLORS['ink']}; letter-spacing: 0; }}
      .node-title-mid {{ font: 700 22px Arial, sans-serif; fill: {COLORS['ink']}; letter-spacing: 0; }}
      .node-text {{ font: 400 17px Arial, sans-serif; fill: {COLORS['muted']}; letter-spacing: 0; }}
      .node-text-mid {{ font: 400 17px Arial, sans-serif; fill: {COLORS['muted']}; letter-spacing: 0; }}
      .small {{ font: 400 14px Arial, sans-serif; fill: {COLORS['muted']}; letter-spacing: 0; }}
      .step {{ font: 700 17px Arial, sans-serif; fill: #fff; letter-spacing: 0; }}
      .label {{ font: 700 15px Arial, sans-serif; fill: {COLORS['muted']}; letter-spacing: 0; }}
      .grid {{ stroke: {COLORS['grid']}; stroke-width: 1; }}
    </style>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
    <marker id="grayArrow" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto"><path d="M 0 0 L 14 5 L 0 10 z" fill="{COLORS['gray_stroke']}"/></marker>
    <marker id="blueArrow" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto"><path d="M 0 0 L 14 5 L 0 10 z" fill="{COLORS['blue_stroke']}"/></marker>
    <marker id="greenArrow" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto"><path d="M 0 0 L 14 5 L 0 10 z" fill="{COLORS['green_stroke']}"/></marker>
    <marker id="orangeArrow" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto"><path d="M 0 0 L 14 5 L 0 10 z" fill="{COLORS['orange_stroke']}"/></marker>
    <marker id="redArrow" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto"><path d="M 0 0 L 14 5 L 0 10 z" fill="{COLORS['red_stroke']}"/></marker>
  </defs>
"""
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{OUTPUT_HEIGHT}" viewBox="0 0 {WIDTH} {OUTPUT_HEIGHT}">\n{defs}\n<rect width="{WIDTH}" height="{OUTPUT_HEIGHT}" fill="{COLORS["bg"]}"/>\n' + "\n".join(body) + "\n</svg>\n"
    SVG_PATH.write_text(svg, encoding="utf-8")


if __name__ == "__main__":
    render_svg()
    render_png()
    print(f"SVG: {SVG_PATH}")
    print(f"PNG: {PNG_PATH}")
