from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets"
SCALE = 4


def new_canvas(width, height):
    return Image.new("RGBA", (width * SCALE, height * SCALE), (0, 0, 0, 0))


def xy(value):
    return int(round(value * SCALE))


def box(bounds):
    return tuple(xy(v) for v in bounds)


def points(items):
    return [(xy(x), xy(y)) for x, y in items]


def draw_line(draw, items, fill, width=1):
    draw.line(points(items), fill=fill, width=xy(width), joint="curve")


def save(img, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    width = img.width // SCALE
    height = img.height // SCALE
    img = img.resize((width, height), Image.Resampling.LANCZOS)
    img.save(path)


def glow_layer(size, drawings):
    img = Image.new("RGBA", (size[0] * SCALE, size[1] * SCALE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    drawings(draw)
    return img.filter(ImageFilter.GaussianBlur(xy(1.2)))


def character_base(width, height):
    img = new_canvas(width, height)
    return img, ImageDraw.Draw(img)


def draw_head(draw, cx, cy, helmet="#172033", skin="#d6a06e"):
    draw.ellipse(box((cx - 9, cy - 10, cx + 9, cy + 11)), fill="#1a1110")
    draw.ellipse(box((cx - 7, cy - 7, cx + 7, cy + 9)), fill=skin, outline="#090706", width=xy(1.3))
    draw.polygon(points([(cx - 10, cy - 8), (cx, cy - 18), (cx + 10, cy - 8), (cx + 5, cy - 1), (cx - 5, cy - 1)]), fill=helmet, outline="#060507")
    draw.line(points([(cx - 4, cy + 1), (cx + 4, cy + 1)]), fill="#40211b", width=xy(1))


def draw_boots(draw, left_x, right_x, foot_y, color="#141316"):
    draw.polygon(points([(left_x - 8, foot_y - 24), (left_x + 4, foot_y - 24), (left_x + 6, foot_y - 2), (left_x - 10, foot_y - 2)]), fill=color, outline="#050506")
    draw.polygon(points([(right_x - 4, foot_y - 24), (right_x + 8, foot_y - 24), (right_x + 12, foot_y - 2), (right_x - 5, foot_y - 2)]), fill=color, outline="#050506")
    draw.ellipse(box((left_x - 13, foot_y - 5, left_x + 6, foot_y + 1)), fill="#0a090a")
    draw.ellipse(box((right_x - 4, foot_y - 5, right_x + 16, foot_y + 1)), fill="#0a090a")


def draw_hero():
    img, draw = character_base(128, 176)

    aura = glow_layer((128, 176), lambda d: d.ellipse(box((35, 34, 96, 168)), fill=(84, 168, 255, 58)))
    img.alpha_composite(aura)

    draw_boots(draw, 52, 76, 168, "#17151a")

    draw.polygon(points([(49, 74), (60, 78), (56, 144), (44, 144)]), fill="#2a3142", outline="#070709")
    draw.polygon(points([(74, 78), (86, 75), (88, 144), (76, 144)]), fill="#2a3142", outline="#070709")
    draw.polygon(points([(45, 67), (84, 66), (98, 142), (68, 160), (34, 144)]), fill="#223f71", outline="#05070c")
    draw.polygon(points([(58, 70), (76, 70), (72, 148), (61, 148)]), fill="#ead8c1", outline="#402b24")
    draw.polygon(points([(43, 57), (87, 54), (82, 91), (51, 94)]), fill="#31445d", outline="#08090d")
    draw.polygon(points([(45, 55), (84, 58), (78, 76), (55, 78)]), fill="#57728f", outline="#111827")
    draw.rectangle(box((51, 88, 82, 96)), fill="#6f3f1c", outline="#1e120b")
    draw.ellipse(box((60, 85, 75, 100)), fill="#d6a13d", outline="#3b2209", width=xy(1))

    draw.polygon(points([(39, 50), (69, 46), (97, 61), (86, 78), (51, 69)]), fill="#8f2730", outline="#2b080b")
    draw.polygon(points([(73, 57), (104, 77), (99, 112), (80, 84)]), fill="#6e1f28", outline="#21070a")

    draw_line(draw, [(45, 78), (33, 111)], "#232734", 8)
    draw_line(draw, [(85, 77), (103, 102)], "#232734", 8)
    draw_line(draw, [(103, 102), (116, 149)], "#050609", 4)
    draw_line(draw, [(105, 103), (123, 146)], "#d9e8f5", 2)
    draw.polygon(points([(119, 143), (126, 152), (116, 149)]), fill="#eef7ff", outline="#111827")
    draw.ellipse(box((28, 105, 40, 117)), fill="#d6a06e", outline="#100807")
    draw.ellipse(box((98, 97, 110, 109)), fill="#d6a06e", outline="#100807")

    draw_head(draw, 66, 40, "#1c2738", "#dca271")
    draw.polygon(points([(58, 27), (68, 12), (77, 27), (70, 22), (65, 5), (61, 22)]), fill="#111827", outline="#050506")
    draw_line(draw, [(52, 63), (81, 68)], "#f2c96d", 2)

    save(img, OUT / "characters" / "hero" / "hero_model.png")


def draw_infantry():
    img, draw = character_base(96, 136)

    draw_boots(draw, 39, 57, 128, "#171514")
    draw.polygon(points([(37, 58), (48, 62), (46, 106), (35, 108)]), fill="#332b26", outline="#090807")
    draw.polygon(points([(54, 62), (65, 58), (68, 108), (56, 106)]), fill="#332b26", outline="#090807")
    draw.polygon(points([(34, 51), (62, 49), (72, 96), (49, 112), (28, 96)]), fill="#513326", outline="#0b0807")
    draw.rectangle(box((35, 55, 65, 82)), fill="#3a3f42", outline="#08090a")
    draw.polygon(points([(31, 45), (69, 49), (64, 65), (37, 65)]), fill="#741e1e", outline="#210606")
    draw.ellipse(box((59, 61, 85, 98)), fill="#5a4037", outline="#0a0807", width=xy(2))
    draw.ellipse(box((64, 68, 78, 91)), fill="#7f5a4c", outline="#1d120f")

    draw_line(draw, [(31, 63), (21, 89)], "#252a2d", 6)
    draw_line(draw, [(22, 88), (12, 112)], "#d8e2e8", 3)
    draw.polygon(points([(11, 112), (14, 122), (7, 114)]), fill="#eef7fb", outline="#1a2028")
    draw_line(draw, [(70, 61), (77, 82)], "#272a2b", 6)

    draw_head(draw, 50, 36, "#2f3438", "#b9825d")
    draw.polygon(points([(43, 22), (50, 7), (58, 22)]), fill="#8d2323", outline="#210606")
    save(img, OUT / "characters" / "enemies" / "enemy_infantry_model.png")


def draw_archer():
    img, draw = character_base(96, 136)

    draw_boots(draw, 40, 58, 128, "#161414")
    draw.polygon(points([(36, 57), (49, 62), (46, 110), (35, 110)]), fill="#282421", outline="#090807")
    draw.polygon(points([(55, 62), (67, 57), (70, 110), (58, 110)]), fill="#282421", outline="#090807")
    draw.polygon(points([(32, 51), (64, 48), (72, 99), (49, 113), (28, 98)]), fill="#483126", outline="#0b0807")
    draw.rectangle(box((36, 53, 64, 80)), fill="#2f3338", outline="#08090a")
    draw.polygon(points([(31, 44), (69, 48), (64, 64), (37, 64)]), fill="#6a2422", outline="#200807")

    draw_line(draw, [(69, 50), (80, 78), (68, 112)], "#1c1818", 3)
    draw.arc(box((60, 44, 91, 118)), start=-75, end=75, fill="#d6b170", width=xy(3))
    draw_line(draw, [(76, 56), (76, 104)], "#efe6d0", 1)
    draw_line(draw, [(38, 64), (75, 72)], "#22252b", 5)
    draw_line(draw, [(43, 66), (83, 68)], "#e6eef3", 2)
    draw.polygon(points([(84, 68), (76, 64), (77, 72)]), fill="#e6eef3", outline="#101318")

    draw_head(draw, 50, 36, "#24282b", "#b9825d")
    draw.polygon(points([(43, 24), (57, 24), (51, 14)]), fill="#8d2323", outline="#210606")
    save(img, OUT / "characters" / "enemies" / "enemy_archer_model.png")


def draw_spearman():
    img, draw = character_base(112, 144)

    draw_line(draw, [(78, 12), (76, 132)], "#33251b", 3)
    draw.polygon(points([(78, 5), (86, 24), (77, 18), (69, 24)]), fill="#e8edf0", outline="#171b20")

    draw_boots(draw, 47, 65, 136, "#171514")
    draw.polygon(points([(44, 62), (55, 67), (52, 116), (41, 116)]), fill="#302b27", outline="#090807")
    draw.polygon(points([(62, 67), (74, 62), (76, 116), (64, 116)]), fill="#302b27", outline="#090807")
    draw.polygon(points([(39, 55), (70, 51), (82, 103), (57, 121), (32, 103)]), fill="#4b342b", outline="#0b0807")
    draw.rectangle(box((43, 57, 72, 86)), fill="#40464b", outline="#090a0c")
    draw.polygon(points([(39, 48), (76, 51), (71, 68), (44, 68)]), fill="#742323", outline="#200807")
    draw_line(draw, [(40, 68), (31, 98)], "#2a2d31", 6)
    draw_line(draw, [(72, 66), (77, 92)], "#2a2d31", 6)
    draw.ellipse(box((27, 91, 39, 103)), fill="#b9825d", outline="#100807")
    draw.ellipse(box((71, 88, 83, 100)), fill="#b9825d", outline="#100807")

    draw_head(draw, 56, 40, "#303437", "#b9825d")
    draw.polygon(points([(49, 26), (56, 10), (64, 26)]), fill="#8d2323", outline="#210606")
    save(img, OUT / "characters" / "enemies" / "enemy_spearman_model.png")


def draw_boss():
    img, draw = character_base(160, 220)

    aura = glow_layer((160, 220), lambda d: d.ellipse(box((36, 24, 124, 210)), fill=(185, 28, 28, 70)))
    img.alpha_composite(aura)

    draw_line(draw, [(28, 58), (124, 182)], "#161113", 8)
    draw_line(draw, [(27, 58), (124, 182)], "#d6b470", 4)
    draw.polygon(points([(22, 50), (41, 61), (30, 66)]), fill="#f2e7c9", outline="#151515")

    draw_boots(draw, 66, 94, 210, "#120f12")
    draw.polygon(points([(58, 88), (74, 94), (72, 174), (55, 176)]), fill="#2c2930", outline="#08070a")
    draw.polygon(points([(89, 94), (106, 88), (110, 176), (92, 174)]), fill="#2c2930", outline="#08070a")
    draw.polygon(points([(54, 78), (103, 76), (124, 166), (83, 204), (37, 166)]), fill="#4b1117", outline="#080304")
    draw.polygon(points([(41, 82), (118, 86), (104, 118), (58, 119)]), fill="#2e3138", outline="#08090b")
    draw.rectangle(box((58, 120, 104, 135)), fill="#9d6323", outline="#291505")
    draw.ellipse(box((72, 112, 92, 140)), fill="#e0ac42", outline="#3a2108", width=xy(1.5))

    draw.polygon(points([(38, 72), (79, 60), (128, 80), (116, 107), (51, 101)]), fill="#8b1f22", outline="#240708")
    draw.polygon(points([(100, 82), (140, 113), (126, 171), (104, 122)]), fill="#61161b", outline="#1a0506")

    draw_line(draw, [(51, 99), (33, 137)], "#2b2d34", 11)
    draw_line(draw, [(112, 98), (132, 132)], "#2b2d34", 11)
    draw.ellipse(box((25, 129, 40, 145)), fill="#bc835c", outline="#120807")
    draw.ellipse(box((126, 124, 141, 140)), fill="#bc835c", outline="#120807")

    draw_head(draw, 82, 54, "#15171d", "#c18a63")
    draw.polygon(points([(65, 42), (82, 13), (100, 42), (91, 34), (82, 4), (73, 34)]), fill="#20242b", outline="#050506")
    draw.polygon(points([(68, 61), (96, 61), (90, 71), (75, 71)]), fill="#111827", outline="#050506")
    draw_line(draw, [(57, 87), (105, 92)], "#e1b75f", 3)

    save(img, OUT / "characters" / "boss" / "boss_model.png")


def draw_firewave():
    img = new_canvas(220, 96)
    glow = glow_layer((220, 96), lambda d: (
        d.ellipse(box((30, 40, 132, 84)), fill=(168, 85, 247, 100)),
        d.ellipse(box((86, 20, 218, 78)), fill=(88, 166, 255, 85)),
    ))
    img.alpha_composite(glow)
    draw = ImageDraw.Draw(img)
    draw.polygon(points([(8, 70), (46, 46), (95, 58), (128, 22), (206, 38), (160, 53), (219, 66), (136, 71), (90, 86)]), fill="#6d28d9", outline="#1f0f46")
    draw.polygon(points([(18, 70), (60, 58), (99, 65), (132, 36), (190, 45), (151, 58), (204, 66), (126, 72), (78, 82)]), fill="#a855f7")
    draw.line(points([(12, 72), (62, 66), (117, 70), (176, 59), (213, 64)]), fill="#f5d0fe", width=xy(4))
    draw.arc(box((74, 18, 142, 78)), start=120, end=330, fill="#c4b5fd", width=xy(4))
    draw.polygon(points([(182, 36), (215, 28), (196, 47)]), fill="#7dd3fc")
    draw.polygon(points([(197, 44), (219, 49), (197, 57)]), fill="#bae6fd")
    save(img, OUT / "effects" / "boss_skill_effect_model.png")


def remove_small_alpha_components(img, min_area=80):
    alpha = img.getchannel("A")
    width, height = img.size
    pixels = alpha.load()
    seen = set()
    keep = set()

    for start_y in range(height):
        for start_x in range(width):
            if (start_x, start_y) in seen or pixels[start_x, start_y] <= 10:
                continue

            stack = [(start_x, start_y)]
            component = []
            seen.add((start_x, start_y))

            while stack:
                x, y = stack.pop()
                component.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    if (nx, ny) in seen or pixels[nx, ny] <= 10:
                        continue
                    seen.add((nx, ny))
                    stack.append((nx, ny))

            if len(component) >= min_area:
                keep.update(component)

    data = img.load()
    for y in range(height):
        for x in range(width):
            if pixels[x, y] > 10 and (x, y) not in keep:
                r, g, b, _a = data[x, y]
                data[x, y] = (r, g, b, 0)

    return img


def crop_existing_model(source, target, manual_crop=None, padding=10, min_component_area=80):
    src_path = OUT / source
    img = Image.open(src_path).convert("RGBA")

    if manual_crop:
        img = img.crop(manual_crop)

    img = remove_small_alpha_components(img, min_component_area)

    alpha_bbox = img.getchannel("A").getbbox()
    if not alpha_bbox:
        raise RuntimeError(f"No visible pixels found in {src_path}")

    img = img.crop(alpha_bbox)
    framed = Image.new(
        "RGBA",
        (img.width + padding * 2, img.height + padding * 2),
        (0, 0, 0, 0),
    )
    framed.alpha_composite(img, (padding, padding))

    out_path = OUT / target
    out_path.parent.mkdir(parents=True, exist_ok=True)
    framed.save(out_path)


def build_models_from_existing_art():
    crop_existing_model(
        "characters/hero/hero_idle.png",
        "characters/hero/hero_model.png",
        padding=8,
    )
    crop_existing_model(
        "characters/enemies/enemy_infantry.png",
        "characters/enemies/enemy_infantry_model.png",
        manual_crop=(0, 0, 108, 203),
        padding=8,
        min_component_area=55,
    )
    crop_existing_model(
        "characters/enemies/enemy_archer.png",
        "characters/enemies/enemy_archer_model.png",
        manual_crop=(0, 0, 132, 203),
        padding=8,
        min_component_area=55,
    )
    crop_existing_model(
        "characters/enemies/enemy_spearman.png",
        "characters/enemies/enemy_spearman_model.png",
        manual_crop=(0, 0, 123, 213),
        padding=8,
        min_component_area=55,
    )
    crop_existing_model(
        "characters/boss/boss_idle.png",
        "characters/boss/boss_model.png",
        manual_crop=(28, 0, 223, 278),
        padding=10,
        min_component_area=160,
    )


def main():
    build_models_from_existing_art()
    draw_firewave()


if __name__ == "__main__":
    main()
