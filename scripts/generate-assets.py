import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ASSETS_DIR = r"c:\Users\Adem\Desktop\altin-iz\assets\images"
NAVY = (11, 18, 32, 255)         # #0B1220
NAVY_SURFACE = (17, 28, 47, 255) # #111C2F
GOLD = (212, 167, 44, 255)       # #D4A72C
GOLD_LIGHT = (245, 196, 81, 255) # #F5C451
GOLD_DARK = (180, 130, 25, 255)
WHITE = (255, 255, 255, 255)
TEXT_MUTED = (170, 178, 192, 255)

def draw_gold_ingot(draw, cx, cy, w, h):
    """Draws a stylized gold bar with 3D bevels and shine."""
    # Top face (trapezoid)
    top_inset_x = w * 0.15
    top_inset_y = h * 0.2
    
    # Outer bottom rectangle
    left = cx - w // 2
    right = cx + w // 2
    top = cy - h // 2
    bottom = cy + h // 2
    
    # Shadow underneath
    draw.rounded_rectangle([left - 6, bottom - 10, right + 6, bottom + 16], radius=16, fill=(5, 8, 15, 180))
    
    # Base bevel (bottom facet)
    draw.polygon([
        (left, bottom),
        (right, bottom),
        (right - top_inset_x, bottom - top_inset_y),
        (left + top_inset_x, bottom - top_inset_y)
    ], fill=GOLD_DARK)
    
    # Left bevel
    draw.polygon([
        (left, bottom),
        (left + top_inset_x, bottom - top_inset_y),
        (left + top_inset_x, top + top_inset_y),
        (left, top)
    ], fill=GOLD)
    
    # Right bevel
    draw.polygon([
        (right, bottom),
        (right - top_inset_x, bottom - top_inset_y),
        (right - top_inset_x, top + top_inset_y),
        (right, top)
    ], fill=GOLD_DARK)
    
    # Top main face
    draw.polygon([
        (left + top_inset_x, top + top_inset_y),
        (right - top_inset_x, top + top_inset_y),
        (right - top_inset_x, bottom - top_inset_y),
        (left + top_inset_x, bottom - top_inset_y)
    ], fill=GOLD_LIGHT)
    
    # Ingot Stamp "999.9" & "ALTIN İZ" text lines
    stamp_y = cy - 4
    draw.line([cx - w*0.2, stamp_y, cx + w*0.2, stamp_y], fill=GOLD_DARK, width=max(2, int(w*0.015)))
    draw.line([cx - w*0.14, stamp_y + 12, cx + w*0.14, stamp_y + 12], fill=GOLD_DARK, width=max(2, int(w*0.012)))

def create_app_icon():
    img = Image.new("RGBA", (1024, 1024), NAVY)
    draw = ImageDraw.Draw(img)
    
    # Radial glow in center
    glow = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for r in range(450, 0, -10):
        alpha = int(45 * (1 - r / 450))
        glow_draw.ellipse([512 - r, 512 - r, 512 + r, 512 + r], fill=(224, 184, 79, alpha))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)
    
    # Draw double stacked gold bars (a classic vault motif)
    # Bottom bar
    draw_gold_ingot(draw, cx=512, cy=580, w=540, h=240)
    # Top bar
    draw_gold_ingot(draw, cx=512, cy=420, w=440, h=200)
    
    out_path = os.path.join(ASSETS_DIR, "icon.png")
    img.save(out_path, "PNG")
    print("Saved:", out_path)

def create_android_foreground():
    # 512x512 transparent foreground with icon in safe zone
    img = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_gold_ingot(draw, cx=256, cy=290, w=270, h=120)
    draw_gold_ingot(draw, cx=256, cy=210, w=220, h=100)
    
    out_path = os.path.join(ASSETS_DIR, "android-icon-foreground.png")
    img.save(out_path, "PNG")
    print("Saved:", out_path)

def create_android_background():
    img = Image.new("RGBA", (512, 512), NAVY)
    glow = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for r in range(250, 0, -10):
        alpha = int(40 * (1 - r / 250))
        glow_draw.ellipse([256 - r, 256 - r, 256 + r, 256 + r], fill=(224, 184, 79, alpha))
    img = Image.alpha_composite(img, glow)
    
    out_path = os.path.join(ASSETS_DIR, "android-icon-background.png")
    img.save(out_path, "PNG")
    print("Saved:", out_path)

def create_splash_icon():
    img = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_gold_ingot(draw, cx=256, cy=285, w=260, h=115)
    draw_gold_ingot(draw, cx=256, cy=205, w=210, h=95)
    
    out_path = os.path.join(ASSETS_DIR, "splash-icon.png")
    img.save(out_path, "PNG")
    print("Saved:", out_path)

def create_feature_graphic():
    # 1024 x 500 Google Play Banner
    img = Image.new("RGBA", (1024, 500), NAVY)
    draw = ImageDraw.Draw(img)
    
    # Radial glow on right side
    glow = Image.new("RGBA", (1024, 500), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for r in range(350, 0, -8):
        alpha = int(45 * (1 - r / 350))
        glow_draw.ellipse([780 - r, 250 - r, 780 + r, 250 + r], fill=(224, 184, 79, alpha))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)
    
    # Draw stacked gold bars on the right
    draw_gold_ingot(draw, cx=780, cy=290, w=340, h=150)
    draw_gold_ingot(draw, cx=780, cy=190, w=280, h=125)
    
    # Left side typography
    # Use default or system sans-serif font
    try:
        font_large = ImageFont.truetype("arial.ttf", 64)
        font_sub = ImageFont.truetype("arial.ttf", 26)
        font_badge = ImageFont.truetype("arial.ttf", 18)
    except:
        font_large = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_badge = ImageFont.load_default()
        
    # Badge
    draw.rounded_rectangle([80, 100, 290, 135], radius=8, fill=(245, 196, 81, 30), outline=(245, 196, 81, 100))
    draw.text((95, 107), "PORTFÖY & PİYASA", font=font_badge, fill=GOLD_LIGHT)
    
    # App Title
    draw.text((80, 160), "Altın İz", font=font_large, fill=WHITE)
    
    # Tagline
    draw.text((80, 250), "Fiziksel Altın Portföyü,\nCanlı Fiyatlar ve Makas Analizi", font=font_sub, fill=TEXT_MUTED)
    
    out_path = os.path.join(ASSETS_DIR, "feature-graphic.png")
    img.save(out_path, "PNG")
    print("Saved:", out_path)

if __name__ == "__main__":
    create_app_icon()
    create_android_foreground()
    create_android_background()
    create_splash_icon()
    create_feature_graphic()
    print("Tüm mağaza ve uygulama varlıkları başarıyla üretildi.")
