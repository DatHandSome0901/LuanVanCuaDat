import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { motion } from "framer-motion";
import { Shield, Trophy, Heart, ArrowLeft, RotateCcw, Volume2, VolumeX, Swords, Award } from "lucide-react";

// Module-level particle pool - renders on native Canvas2D overlay (NOT Phaser)
interface NativeParticle { x:number;y:number;vx:number;vy:number;r:number;color:number;life:number;maxLife:number; }
const _nativeParticles: NativeParticle[] = [];
const _hexToRgb = (hex: number) => `rgb(${(hex>>16)&255},${(hex>>8)&255},${hex&255})`;

interface HaoKhiGameProps {
  onClose: () => void;
}

// ==========================================
// 1. DYNAMIC PROGRAMMATIC ASSET GENERATORS
// ==========================================
const createTextureFromCanvas = (
  game: Phaser.Game,
  key: string,
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D) => void
) => {
  if (game.textures.exists(key)) return;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    drawFn(ctx);
    game.textures.addCanvas(key, canvas);
  }
};

const createSpritesheetFromCanvas = (
  game: Phaser.Game,
  key: string,
  width: number,
  height: number,
  frameWidth: number,
  frameHeight: number,
  drawFn: (ctx: CanvasRenderingContext2D) => void
) => {
  if (game.textures.exists(key)) return;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    drawFn(ctx);
    game.textures.addSpriteSheet(key, canvas as any, { frameWidth, frameHeight });
  }
};

// Generates hand-drawn style spritesheets & background textures
const generateGameAssets = (game: Phaser.Game) => {
  // --- PLAYER SPRITESHEET (15 frames, each 64x64) - LÊ LỢI (Anime warrior style) ---
  createSpritesheetFromCanvas(game, "player_sheet", 960, 64, 64, 64, (ctx) => {
    for (let f = 0; f < 15; f++) {
      const cx = f * 64 + 32;
      const cy = 44; // feet at bottom

      ctx.save();
      ctx.shadowBlur = 3;
      ctx.shadowColor = "rgba(0,0,0,0.6)";

      // Animation state
      let bob = 0, legSwing = 0, hairFlow = 0;
      let isAttacking = false, isHurt = false, isJump = false;
      let attackPhase = 0;

      if (f >= 0 && f <= 3) { // IDLE - gentle breathe
        bob = Math.sin(f * Math.PI / 2) * 1.2;
        hairFlow = Math.sin(f * Math.PI / 2) * 2;
      } else if (f >= 4 && f <= 9) { // RUN
        const t = (f - 4) / 6 * Math.PI * 2;
        bob = Math.sin(t * 2) * 2.5;
        legSwing = Math.sin(t) * 22;
        hairFlow = 18 + Math.sin(t) * 6; // hair flows back when running
      } else if (f === 10) { // JUMP
        isJump = true; bob = -4; legSwing = -10; hairFlow = 12;
      } else if (f >= 11 && f <= 13) { // ATTACK
        isAttacking = true;
        attackPhase = f - 11; // 0=windup, 1=strike, 2=follow
        bob = attackPhase === 1 ? 2 : 0;
        hairFlow = 25 + attackPhase * 8;
        legSwing = attackPhase === 1 ? 8 : 0;
      } else if (f === 14) { // HURT
        isHurt = true; bob = -3; hairFlow = -8;
      }

      const by = cy + bob; // base Y with bob

      // ── BOOTS (draw first, behind legs) ──────────────────────────────
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(cx - 7, by - 2, 6, 8);
      ctx.fillRect(cx + 1, by - 2, 6, 8);

      // ── LEGS - dark pants ─────────────────────────────────────────────
      const lOff = Math.sin(legSwing * Math.PI / 180) * 7;
      ctx.strokeStyle = "#292524"; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx - 4, by - 10); ctx.lineTo(cx - 4 + lOff, by); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 4, by - 10); ctx.lineTo(cx + 4 - lOff, by); ctx.stroke();

      // ── ROBE SKIRT (áo dài đỏ nâu, split at legs) ────────────────────
      ctx.fillStyle = isHurt ? "#fca5a5" : "#7f1d1d";
      // Left panel
      ctx.beginPath();
      ctx.moveTo(cx - 2, by - 18);
      ctx.bezierCurveTo(cx - 14, by - 12, cx - 12, by - 4, cx - 8, by + 2);
      ctx.lineTo(cx - 4, by + 2);
      ctx.lineTo(cx - 3, by - 18);
      ctx.closePath(); ctx.fill();
      // Right panel
      ctx.fillStyle = isHurt ? "#fca5a5" : "#991b1b";
      ctx.beginPath();
      ctx.moveTo(cx + 2, by - 18);
      ctx.bezierCurveTo(cx + 14, by - 12, cx + 12, by - 4, cx + 8, by + 2);
      ctx.lineTo(cx + 4, by + 2);
      ctx.lineTo(cx + 3, by - 18);
      ctx.closePath(); ctx.fill();

      // ── BODY ARMOR (chest plate - dark + gold dragon) ─────────────────
      // Base robe body
      ctx.fillStyle = isHurt ? "#fca5a5" : "#7f1d1d";
      ctx.beginPath(); ctx.roundRect(cx - 10, by - 32, 20, 18, 2); ctx.fill();

      // Dark armor overlay
      ctx.fillStyle = "#292524";
      ctx.beginPath(); ctx.roundRect(cx - 8, by - 30, 16, 14, 2); ctx.fill();

      // Gold dragon chest emblem
      ctx.fillStyle = "#d97706";
      ctx.beginPath(); ctx.arc(cx, by - 24, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath(); ctx.arc(cx, by - 24, 3, 0, Math.PI * 2); ctx.fill();
      // Dragon scale pattern
      ctx.strokeStyle = "#b45309"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(cx, by - 24, 4.5, 0, Math.PI * 2); ctx.stroke();

      // Gold shoulder pads (giáp vai)
      ctx.fillStyle = "#b45309";
      ctx.beginPath(); ctx.ellipse(cx - 10, by - 28, 5, 3.5, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d97706";
      ctx.beginPath(); ctx.ellipse(cx - 10, by - 28, 4, 2.5, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#b45309";
      ctx.beginPath(); ctx.ellipse(cx + 10, by - 28, 5, 3.5, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d97706";
      ctx.beginPath(); ctx.ellipse(cx + 10, by - 28, 4, 2.5, 0.3, 0, Math.PI * 2); ctx.fill();

      // Gold sash belt
      ctx.fillStyle = "#d97706";
      ctx.fillRect(cx - 10, by - 18, 20, 3);
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(cx - 10, by - 18, 20, 1);

      // ── HEAD - anime style, sharp features ────────────────────────────
      // Neck
      ctx.fillStyle = "#fde68a";
      ctx.fillRect(cx - 3, by - 38, 6, 7);

      // Face
      ctx.fillStyle = isHurt ? "#fca5a5" : "#fde68a";
      ctx.beginPath(); ctx.ellipse(cx, by - 44, 7, 8, 0, 0, Math.PI * 2); ctx.fill();

      // Jaw line (slightly angular, anime style)
      ctx.fillStyle = isHurt ? "#fca5a5" : "#fcd34d";
      ctx.beginPath();
      ctx.moveTo(cx - 6, by - 43);
      ctx.lineTo(cx - 5, by - 38);
      ctx.lineTo(cx, by - 36);
      ctx.lineTo(cx + 5, by - 38);
      ctx.lineTo(cx + 6, by - 43);
      ctx.closePath(); ctx.fill();

      // Eyes - sharp anime eyes
      ctx.fillStyle = isHurt ? "#ef4444" : "#1c1917";
      ctx.fillRect(cx - 5, by - 46, 4, 2.5);
      ctx.fillRect(cx + 1, by - 46, 4, 2.5);
      // Eye highlight
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - 4.5, by - 46.5, 1.5, 1.2);
      ctx.fillRect(cx + 1.5, by - 46.5, 1.5, 1.2);

      // ── HAIR - black ponytail with red ribbon ─────────────────────────
      // Main hair mass (top/front)
      ctx.fillStyle = "#0c0a09";
      ctx.beginPath();
      ctx.ellipse(cx, by - 51, 7.5, 6, 0, 0, Math.PI * 2); ctx.fill();
      // Hair side strands
      ctx.beginPath();
      ctx.moveTo(cx - 7, by - 49);
      ctx.bezierCurveTo(cx - 11, by - 46, cx - 9, by - 42, cx - 7, by - 39);
      ctx.lineTo(cx - 5, by - 40);
      ctx.bezierCurveTo(cx - 6, by - 44, cx - 8, by - 47, cx - 5, by - 49);
      ctx.closePath(); ctx.fill();

      // Ponytail base + tie point
      ctx.fillStyle = "#0c0a09";
      ctx.beginPath();
      ctx.moveTo(cx + 2, by - 54);
      ctx.bezierCurveTo(
        cx + 8 + hairFlow * 0.3, by - 52 + hairFlow * 0.1,
        cx + 12 + hairFlow * 0.6, by - 46 + hairFlow * 0.3,
        cx + 8 + hairFlow, by - 38 + hairFlow * 0.5
      );
      ctx.lineWidth = 4; ctx.strokeStyle = "#0c0a09"; ctx.stroke();
      ctx.lineWidth = 2.5; ctx.strokeStyle = "#1c1917"; ctx.stroke();

      // Red ribbon on ponytail
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(cx + 4, by - 52, 2.5, 0, Math.PI * 2); ctx.fill();
      // Ribbon tail
      ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + 4, by - 52);
      ctx.bezierCurveTo(cx + 9 + hairFlow * 0.2, by - 49, cx + 7 + hairFlow * 0.3, by - 45, cx + 5 + hairFlow * 0.2, by - 42);
      ctx.stroke();

      // ── SWORD ARM ─────────────────────────────────────────────────────
      ctx.save();
      ctx.translate(cx, by - 22);

      if (isAttacking) {
        // Attack swing phases
        const swingAngle = attackPhase === 0 ? -60 : attackPhase === 1 ? 20 : -10;
        ctx.rotate(swingAngle * Math.PI / 180);

        // Arm
        ctx.strokeStyle = "#fde68a"; ctx.lineWidth = 4; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(10, -4); ctx.stroke();

        // GƯƠM THUẬN THIÊN - glowing on attack
        ctx.shadowColor = "#06b6d4"; ctx.shadowBlur = 12;
        ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(36, -8); ctx.stroke();
        ctx.strokeStyle = "#e0f2fe"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(10, -4.5); ctx.lineTo(34, -8.5); ctx.stroke();
        ctx.shadowBlur = 0;

        // Guard + hilt
        ctx.fillStyle = "#d97706";
        ctx.fillRect(5, -7, 5, 6);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(3, -9, 7, 3);

      } else {
        // Sword at hip (resting position)
        ctx.rotate(-25 * Math.PI / 180);

        // Arm holding scabbard
        ctx.strokeStyle = "#fde68a"; ctx.lineWidth = 4; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(8, 2); ctx.stroke();

        // Scabbard
        ctx.fillStyle = "#292524";
        ctx.fillRect(6, -2, 3, 22);
        // Sword handle sticking out
        ctx.fillStyle = "#78350f";
        ctx.fillRect(4, -8, 5, 8);
        ctx.fillStyle = "#d97706"; // guard
        ctx.fillRect(3, -2, 7, 2.5);
      }
      ctx.restore();

      ctx.restore();
    }
  });


  // --- ENEMY 1: SPEARMAN MING SOLDIER (BỘ BINH GIẶC MINH) ---
  createSpritesheetFromCanvas(game, "enemy_normal", 256, 64, 64, 64, (ctx) => {
    for (let f = 0; f < 4; f++) {
      const cx = f * 64 + 32;
      const cy = 40;
      const t = f / 4 * Math.PI * 2;
      const bob = Math.sin(t) * 1.5;

      ctx.save();
      // Heavy Grey Coat
      ctx.fillStyle = "#4b5563";
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy - 18 + bob);
      ctx.lineTo(cx - 14, cy + 8);
      ctx.lineTo(cx - 5, cy + 8);
      ctx.closePath();
      ctx.fill();

      // Legs
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy - 4);
      ctx.lineTo(cx - 6 + Math.sin(t) * 4, cy + 8);
      ctx.moveTo(cx + 3, cy - 4);
      ctx.lineTo(cx + 2 - Math.sin(t) * 4, cy + 8);
      ctx.stroke();

      // Red chest tunic
      ctx.fillStyle = "#991b1b";
      ctx.beginPath();
      ctx.arc(cx, cy - 11 + bob, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // Ming Straw-Iron Hat (Mũ giặc Minh)
      ctx.fillStyle = "#d1d5db";
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 22 + bob);
      ctx.lineTo(cx + 8, cy - 22 + bob);
      ctx.lineTo(cx, cy - 29 + bob);
      ctx.closePath();
      ctx.fill();
      
      // Red cap tassel
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(cx - 1, cy - 32 + bob, 2, 4);

      // Red Eyes
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(cx + 1.5, cy - 20 + bob, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Iron Spear
      ctx.save();
      ctx.translate(cx, cy - 8 + bob);
      ctx.rotate(-45 * Math.PI / 180);
      ctx.strokeStyle = "#4b5563";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, 0);
      ctx.stroke();
      // Red ribbon
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(20, -1, 3, 3);
      // Spearhead
      ctx.fillStyle = "#9ca3af";
      ctx.beginPath();
      ctx.moveTo(24, -2.5);
      ctx.lineTo(31, 0);
      ctx.lineTo(24, 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }
  });

  // --- ENEMY 2: SHIELD MING SOLDIER (ĐAO KHIÊN BINH GIẶC MINH) ---
  createSpritesheetFromCanvas(game, "enemy_shield", 256, 64, 64, 64, (ctx) => {
    for (let f = 0; f < 4; f++) {
      const cx = f * 64 + 32;
      const cy = 40;
      const t = f / 4 * Math.PI * 2;
      const bob = Math.sin(t) * 1.2;

      ctx.save();
      // Legs
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy - 4);
      ctx.lineTo(cx - 5 + Math.sin(t) * 3, cy + 8);
      ctx.moveTo(cx + 3, cy - 4);
      ctx.lineTo(cx + 1 - Math.sin(t) * 3, cy + 8);
      ctx.stroke();

      // Heavy grey coat
      ctx.fillStyle = "#374151";
      ctx.beginPath();
      ctx.arc(cx, cy - 10 + bob, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Straw cap
      ctx.fillStyle = "#ca8a04";
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 20 + bob);
      ctx.lineTo(cx + 8, cy - 20 + bob);
      ctx.lineTo(cx, cy - 26 + bob);
      ctx.closePath();
      ctx.fill();

      // Red Glow eyes
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(cx - 1.5, cy - 17 + bob, 4, 1.5);

      // IRON SHIELD WITH EVIL PATTERN
      ctx.fillStyle = "#1f2937";
      ctx.strokeStyle = "#991b1b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy - 22 + bob);
      ctx.lineTo(cx + 13, cy - 19 + bob);
      ctx.lineTo(cx + 13, cy + 6 + bob);
      ctx.lineTo(cx + 4, cy + 9 + bob);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Ming character / emblem mark
      ctx.fillStyle = "#b45309";
      ctx.fillRect(cx + 7, cy - 10 + bob, 3, 8);

      ctx.restore();
    }
  });

  // --- ENEMY 3: MING ARCHER (CUNG THỦ GIẶC MINH) ---
  createSpritesheetFromCanvas(game, "enemy_archer", 256, 64, 64, 64, (ctx) => {
    for (let f = 0; f < 4; f++) {
      const cx = f * 64 + 32;
      const cy = 40;
      const t = f / 4 * Math.PI * 2;
      const bob = Math.sin(t) * 1.5;

      ctx.save();
      // Legs
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy - 4);
      ctx.lineTo(cx - 4 + Math.sin(t) * 4, cy + 8);
      ctx.moveTo(cx + 2, cy - 4);
      ctx.lineTo(cx + 2 - Math.sin(t) * 4, cy + 8);
      ctx.stroke();

      // Light coat
      ctx.fillStyle = "#4b5563";
      ctx.beginPath();
      ctx.arc(cx, cy - 12 + bob, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Archer cap
      ctx.fillStyle = "#111827";
      ctx.beginPath();
      ctx.arc(cx, cy - 22 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Feathers
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(cx - 1, cy - 26 + bob);
      ctx.lineTo(cx - 5, cy - 32 + bob);
      ctx.lineTo(cx - 2, cy - 26 + bob);
      ctx.closePath();
      ctx.fill();

      // Red eyes
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(cx + 1, cy - 20 + bob, 1, 0, Math.PI * 2);
      ctx.fill();

      // Bamboo Bow
      ctx.strokeStyle = "#a16207";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy - 20 + bob);
      ctx.quadraticCurveTo(cx + 12, cy - 15 + bob, cx + 8, cy - 2 + bob);
      ctx.stroke();
      
      // Bow string
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy - 20 + bob);
      ctx.lineTo(cx + 8, cy - 2 + bob);
      ctx.stroke();

      ctx.restore();
    }
  });

  // --- BOSS: TƯỚNG GIẶC LIỄU THĂNG ---
  createSpritesheetFromCanvas(game, "boss_lieu_thang", 256, 64, 64, 64, (ctx) => {
    for (let f = 0; f < 4; f++) {
      const cx = f * 64 + 32;
      const cy = 40;
      const t = f / 4 * Math.PI * 2;
      const bob = Math.sin(t) * 1.5;

      ctx.save();
      
      // Giant dark red general's cape
      ctx.fillStyle = "#7f1d1d";
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy - 20 + bob);
      ctx.lineTo(cx - 18, cy + 12);
      ctx.lineTo(cx - 5, cy + 12);
      ctx.closePath();
      ctx.fill();

      // Heavy golden/bronze leg plates
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 4);
      ctx.lineTo(cx - 7 + Math.sin(t) * 3, cy + 8);
      ctx.moveTo(cx + 4, cy - 4);
      ctx.lineTo(cx + 3 - Math.sin(t) * 3, cy + 8);
      ctx.stroke();

      // Heavy Ming general armor chest plate
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(cx, cy - 12 + bob, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Golden beast motif chest emblem
      ctx.fillStyle = "#d97706";
      ctx.beginPath();
      ctx.arc(cx, cy - 12 + bob, 5, 0, Math.PI * 2);
      ctx.fill();

      // General's iron helmet with long red tassel
      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.arc(cx, cy - 25 + bob, 7, 0, Math.PI * 2);
      ctx.fill();
      
      // Golden wings on helmet
      ctx.fillStyle = "#d97706";
      ctx.fillRect(cx - 9, cy - 27 + bob, 18, 2);
      
      // Tassel flying
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 32 + bob);
      ctx.quadraticCurveTo(cx - 8, cy - 38 + bob, cx - 12, cy - 28 + bob);
      ctx.lineTo(cx - 2, cy - 30 + bob);
      ctx.closePath();
      ctx.fill();

      // Angry yellow-glowing eyes
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(cx + 2, cy - 25 + bob, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Giant Guan Dao (Đại đao tướng giặc)
      ctx.save();
      ctx.translate(cx, cy - 8 + bob);
      ctx.rotate(-60 * Math.PI / 180);
      ctx.strokeStyle = "#78350f"; // Wood staff
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(35, 0);
      ctx.stroke();
      
      // Massive Crescent Blade
      ctx.fillStyle = "#cbd5e1"; 
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(35, -3);
      ctx.lineTo(55, -6);
      ctx.lineTo(58, 2);
      ctx.lineTo(35, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Tassel
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(33, -2, 3, 4);

      ctx.restore();
      ctx.restore();
    }
  });

  // --- PROJECTILES & EFFECTS ---
  // 1. Arrow (Tên giặc Minh)
  createTextureFromCanvas(game, "arrow", 24, 6, (ctx) => {
    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(18, 3);
    ctx.stroke();
    // Arrowhead
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.moveTo(18, 1);
    ctx.lineTo(24, 3);
    ctx.lineTo(18, 5);
    ctx.closePath();
    ctx.fill();
    // Feathers
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(0, 1, 4, 1.5);
    ctx.fillRect(0, 3.5, 4, 1.5);
  });

  // 2. Boss Firewave (Đạn lửa/Đao khí của Liễu Thăng)
  createTextureFromCanvas(game, "firewave", 32, 16, (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, 32, 0);
    grad.addColorStop(0, "rgba(220, 38, 38, 0)");
    grad.addColorStop(0.5, "rgba(249, 115, 22, 0.95)");
    grad.addColorStop(0.8, "rgba(253, 224, 71, 1)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 8, 12, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(32, 8);
    ctx.closePath();
    ctx.fill();
  });

  // 3. GƯƠM THẦN TỰA THIÊN GLOW SLASH (Hiệu ứng chém hào quang xanh)
  createTextureFromCanvas(game, "slash_glow", 96, 64, (ctx) => {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 96, 0);
    grad.addColorStop(0, "rgba(6, 182, 212, 0)");
    grad.addColorStop(0.4, "rgba(8, 145, 178, 0.95)");
    grad.addColorStop(0.8, "rgba(165, 243, 252, 1)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(48, 32, 38, -Math.PI / 3, Math.PI / 3, false);
    ctx.quadraticCurveTo(72, 32, 80, 32);
    ctx.arc(48, 32, 28, Math.PI / 3, -Math.PI / 3, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // 4. Smoke / Fog
  createTextureFromCanvas(game, "fog", 128, 128, (ctx) => {
    const radGrad = ctx.createRadialGradient(64, 64, 5, 64, 64, 60);
    radGrad.addColorStop(0, "rgba(30, 41, 59, 0.25)");
    radGrad.addColorStop(0.5, "rgba(15, 23, 42, 0.08)");
    radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 128, 128);
  });
};

// ==========================================
// 2. CORE PHASER 3 GAME SCENE
// ==========================================
class HaoKhiScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;

  private mapWidth = 2600;
  private mapHeight = 720;
  
  private playerHealth = 100;
  private playerScore = 0;
  private isInvincible = false;
  private lastAttackTime = 0;
  private lastSpawnTime = 0;
  private playerState = "idle";
  private readonly characterScale = 1.35;
  private readonly enemyScale = 1.25;
  private readonly spawnIntervalMs = 5500;
  private readonly maxActiveEnemies = 4;

  // Boss Battle fields
  private boss: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null;
  private bossActive = false;
  private bossHealth = 500;
  private readonly bossMaxHealth = 500;

  // Parallax layers group
  private bgSky!: Phaser.GameObjects.Graphics;
  private bgMountains!: Phaser.GameObjects.Graphics;
  private bgPagodas!: Phaser.GameObjects.Graphics;
  private bambooTrees: Phaser.GameObjects.Container[] = [];
  // particleGraphics removed - particles now rendered on native Canvas2D overlay
  private gameTime = 0;

  constructor() {
    super("HaoKhiScene");
  }

  private quadraticLineTo(
    graphics: Phaser.GameObjects.Graphics,
    fromX: number,
    fromY: number,
    controlX: number,
    controlY: number,
    toX: number,
    toY: number,
    steps = 8
  ) {
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = Phaser.Math.Interpolation.QuadraticBezier(t, fromX, controlX, toX);
      const y = Phaser.Math.Interpolation.QuadraticBezier(t, fromY, controlY, toY);
      graphics.lineTo(x, y);
    }
  }

  init() {
    this.playerHealth = 100;
    this.playerScore = 0;
    this.isInvincible = false;
    this.lastAttackTime = 0;
    this.lastSpawnTime = 0;
    
    this.boss = null;
    this.bossActive = false;
    this.bossHealth = 500;
  }

  create() {
    generateGameAssets(this.game);

    // Set world physics bounds
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // 1. Create Parallax & Hand-Drawn Background Layers
    this.createAtmosphericBackground();

    // 2. Create Dynamic Platforms & Ground
    this.createPlatforms();

    // 3. Create Player (Lê Lợi)
    this.createPlayer();

    // 4. Create Groups
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();

    // 5. Input Setup
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        D: Phaser.Input.Keyboard.KeyCodes.D
      }) as any;
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // 6. Physics Colliders
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    // Projectile hits platform → destroy (check active first to avoid double-destroy)
    this.physics.add.collider(
      this.projectiles, this.platforms,
      (p: any) => { if (p?.active) p.destroy(); }
    );
    
    // Player vs Enemy Projectile - processCallback guards against destroyed projectiles
    this.physics.add.overlap(
      this.player, this.projectiles,
      this.handleProjectileHit,
      // processCallback: return false to skip if already destroyed
      (_player: any, proj: any) => proj?.active === true,
      this
    );
    this.physics.add.overlap(
      this.player, this.enemies,
      this.handlePlayerEnemyContact,
      (_player: any, enemy: any) => enemy?.active === true,
      this
    );

    // 7. Camera follow
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.35);

    // Spawn initial level enemies
    this.spawnInitialGuards();
    this.lastSpawnTime = this.time.now;

    // Clear native particle pool on scene restart
    _nativeParticles.length = 0;

    // Spawn forest fog/mist
    this.createFogClouds();

    // Pause scene initially if React hasn't started the game
    this.time.delayedCall(50, () => {
      if (!this.game.registry.get("gameStarted")) {
        this.scene.pause();
      }
    });
  }

  update(time: number, delta: number) {
    if (this.playerHealth <= 0) return;
    this.gameTime = time;

    // A. Handle Player controls
    this.handlePlayerControls(time);

    // B. Sway bamboo forest (throttled every 3 frames)
    if (Math.floor(time / 16) % 3 === 0) {
      this.updateParallax(time);
    }

    // C. Enemy AI & Projectiles
    this.updateEnemyAI(time);
    
    // Boss AI loop
    if (this.bossActive && this.boss) {
      this.updateBossAI(time);
    }

    // Trigger Boss entry at Pass
    if (this.player.x > 1850 && !this.bossActive && !this.boss) {
      this.triggerBossFight();
    }

    // D. Spawning waves dynamically (only before boss territory)
    if (!this.bossActive && this.player.x < 1750) {
      if (time - this.lastSpawnTime > this.spawnIntervalMs && this.enemies.countActive(true) < this.maxActiveEnemies) {
        this.spawnEnemyWave();
        this.lastSpawnTime = time;
      }
    }

    // React state bridges (throttle to 10fps)
    if (Math.floor(time / 100) !== Math.floor((time - delta) / 100)) {
      this.events.emit("scoreChanged", this.playerScore);
      this.events.emit("healthChanged", this.playerHealth);
    }
  }

  private createAtmosphericBackground() {
    // 1. Sky - bầu trời Việt Nam: xanh lam sáng -> hoàng hôn đỏ cam
    this.bgSky = this.add.graphics();
    this.bgSky.setScrollFactor(0);
    this.bgSky.fillGradientStyle(0x0a1628, 0x0a1628, 0x8b1a1a, 0xc2410c, 1);
    this.bgSky.fillRect(0, 0, 1280, 720);

    // Mặt trăng rằm tròn (trăng chiến trận)
    this.bgSky.fillStyle(0xfef9c3, 0.95);
    this.bgSky.fillCircle(980, 110, 52);
    this.bgSky.fillStyle(0xfef08a, 0.6);
    this.bgSky.fillCircle(980, 110, 70);
    this.bgSky.fillStyle(0xd97706, 0.15);
    this.bgSky.fillCircle(980, 110, 100);
    // Vệt trăng lung linh
    this.bgSky.fillStyle(0xfef9c3, 0.07);
    this.bgSky.fillRect(940, 120, 80, 600);

    // Sao trời (stars)
    const starPositions = [[120,60],[250,35],[400,80],[550,45],[700,70],[820,30],[1100,55],[1180,90],[200,120],[600,110],[1050,40]];
    starPositions.forEach(([sx, sy]) => {
      this.bgSky.fillStyle(0xffffff, 0.7 + Math.random() * 0.3);
      this.bgSky.fillCircle(sx, sy, 1.5 + Math.random() * 1.5);
    });

    // Cờ đỏ sao vàng bay phất phới (background symbol)
    const flagG = this.add.graphics();
    flagG.setScrollFactor(0.05);
    flagG.setDepth(2);
    // Cán cờ
    flagG.fillStyle(0x78350f, 1);
    flagG.fillRect(60, 40, 5, 220);
    // Nền đỏ
    flagG.fillStyle(0xdc2626, 0.55);
    flagG.beginPath();
    flagG.moveTo(65, 45);
    flagG.lineTo(185, 55);
    flagG.lineTo(180, 130);
    flagG.lineTo(65, 120);
    flagG.closePath();
    flagG.fillPath();
    // Ngôi sao vàng 5 cánh
    const drawStar5 = (g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number) => {
      g.fillStyle(0xfde047, 0.7);
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? r : r * 0.4;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        i === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
      }
      g.closePath();
      g.fillPath();
    };
    drawStar5(flagG, 125, 83, 22);

    // 2. Dãy núi Lam Sơn hùng vĩ (Layer 2)
    this.bgMountains = this.add.graphics();
    this.bgMountains.setScrollFactor(0.08);
    // Núi xa - tím xanh
    this.bgMountains.fillStyle(0x1e1b4b, 0.8);
    this.bgMountains.beginPath();
    this.bgMountains.moveTo(0, 720);
    const mountainPoints = [
      [0, 350], [160, 260], [350, 400], [520, 220],
      [720, 370], [900, 250], [1100, 420], [1300, 200],
      [1500, 380], [1700, 240], [1900, 390], [2150, 210],
      [2350, 360], [2600, 180]
    ];
    mountainPoints.forEach(([x, y]) => this.bgMountains.lineTo(x, y));
    this.bgMountains.lineTo(2600, 720);
    this.bgMountains.closePath();
    this.bgMountains.fillPath();
    // Núi gần - xanh đậm hơn
    this.bgMountains.fillStyle(0x14532d, 0.5);
    this.bgMountains.beginPath();
    this.bgMountains.moveTo(0, 720);
    [[0,480],[200,400],[400,510],[600,380],[800,490],[1000,370],[1200,500],[1400,420],[1600,490],[1800,380],[2000,510],[2200,400],[2400,480],[2600,350]]
      .forEach(([x,y]) => this.bgMountains.lineTo(x, y));
    this.bgMountains.lineTo(2600, 720);
    this.bgMountains.closePath();
    this.bgMountains.fillPath();

    // 3. Chùa Một Cột & Văn Miếu silhouettes (Layer 3)
    this.bgPagodas = this.add.graphics();
    this.bgPagodas.setScrollFactor(0.2);
    this.bgPagodas.fillStyle(0x0c0a09, 0.75);

    // Chùa cổ đa tầng (multi-tier pagoda)
    const drawVietnamesePagoda = (x: number, y: number, sc: number) => {
      const g = this.bgPagodas;
      // Móng
      g.fillRect(x - 45*sc, y, 90*sc, 20*sc);
      // Tầng 1
      g.fillRect(x - 35*sc, y - 28*sc, 70*sc, 28*sc);
      // Mái tầng 1 (cong)
      g.beginPath(); g.moveTo(x - 50*sc, y - 28*sc);
      g.lineTo(x, y - 48*sc); g.lineTo(x + 50*sc, y - 28*sc);
      g.closePath(); g.fillPath();
      // Tầng 2
      g.fillRect(x - 25*sc, y - 58*sc, 50*sc, 28*sc);
      g.beginPath(); g.moveTo(x - 38*sc, y - 58*sc);
      g.lineTo(x, y - 75*sc); g.lineTo(x + 38*sc, y - 58*sc);
      g.closePath(); g.fillPath();
      // Đỉnh tháp
      g.fillRect(x - 5*sc, y - 95*sc, 10*sc, 20*sc);
      // Đèn lồng đỏ
      g.fillStyle(0xdc2626, 0.4);
      g.fillCircle(x, y - 35*sc, 5*sc);
      g.fillStyle(0x0c0a09, 0.75);
    };
    drawVietnamesePagoda(280, 490, 1.1);
    drawVietnamesePagoda(1050, 465, 1.4);
    drawVietnamesePagoda(1880, 480, 1.0);
    drawVietnamesePagoda(2400, 470, 0.85);

    // Ruộng lúa bậc thang (terraced rice fields) - mid bg
    const riceG = this.add.graphics();
    riceG.setScrollFactor(0.15);
    riceG.setDepth(1);
    for (let tier = 0; tier < 5; tier++) {
      riceG.fillStyle(0x166534, 0.22 - tier * 0.03);
      riceG.fillRect(0, 560 + tier * 12, 2600, 14);
      riceG.fillStyle(0x15803d, 0.1);
      riceG.fillRect(0, 562 + tier * 12, 2600, 5);
    }

    // Hoa sen ao nước (lotus pond) trang trí
    const lotusG = this.add.graphics();
    lotusG.setScrollFactor(0.3);
    lotusG.setDepth(3);
    const drawLotus = (lx: number, ly: number) => {
      // Lá sen
      lotusG.fillStyle(0x166534, 0.5);
      lotusG.fillEllipse(lx, ly + 5, 28, 12);
      // Hoa
      for (let p = 0; p < 6; p++) {
        const ang = (p / 6) * Math.PI * 2;
        lotusG.fillStyle(0xfda4af, 0.7);
        lotusG.fillEllipse(lx + Math.cos(ang) * 7, ly + Math.sin(ang) * 5 - 3, 8, 12);
      }
      lotusG.fillStyle(0xfde047, 0.8);
      lotusG.fillCircle(lx, ly - 3, 4);
    };
    [[300,620],[700,615],[1200,618],[1800,622],[2300,616]].forEach(([lx,ly]) => drawLotus(lx, ly));

    // 4. Parallax Bamboo Forest (Layer 4) - giảm từ 28 → 15 để tránh lag
    for (let i = 0; i < 15; i++) {
      const bx = i * 175 + Math.random() * 60;
      const by = 250 + Math.random() * 100;
      const bHeight = 360 + Math.random() * 100;
      const bWidth = 5 + Math.random() * 4;
      
      const bamboo = this.add.container(bx, by);
      bamboo.setScrollFactor(0.28 + Math.random() * 0.16);

      const stalk = this.add.graphics();
      stalk.fillStyle(0x192723, 0.48);
      stalk.fillRect(-bWidth / 2, 0, bWidth, bHeight);
      
      stalk.fillStyle(0x080a0a, 0.5);
      for (let n = 0; n < bHeight; n += 50 + Math.random() * 20) {
        stalk.fillRect(-bWidth / 2 - 1, n, bWidth + 2, 3);
      }
      
      stalk.fillStyle(0x101c18, 0.4);
      for (let l = 0; l < 5; l++) {
        const leafY = Math.random() * bHeight;
        const leafDir = Math.random() > 0.5 ? 1 : -1;
        stalk.beginPath();
        stalk.moveTo(0, leafY);
        this.quadraticLineTo(stalk, 0, leafY, 15 * leafDir, leafY - 10, 25 * leafDir, leafY + 3, 5);
        this.quadraticLineTo(stalk, 25 * leafDir, leafY + 3, 12 * leafDir, leafY + 2, 0, leafY, 5);
        stalk.closePath();
        stalk.fillPath();
      }

      bamboo.add(stalk);
      this.bambooTrees.push(bamboo);
    }
  }

  private createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    // Earthy brown textured ground
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    groundGraphics.fillGradientStyle(0x22130a, 0x22130a, 0x090402, 0x090402, 1);
    groundGraphics.fillRect(0, 0, this.mapWidth, 80);
    // Golden border trim
    groundGraphics.fillStyle(0xd97706, 0.7);
    groundGraphics.fillRect(0, 0, this.mapWidth, 5);
    groundGraphics.fillStyle(0xfef08a, 0.4);
    groundGraphics.fillRect(0, 0, this.mapWidth, 2);
    
    groundGraphics.generateTexture("ground_line", this.mapWidth, 80);
    
    const ground = this.platforms.create(this.mapWidth / 2, 680, "ground_line");
    ground.refreshBody();

    // Curved metroidvania ledges/platforms
    const createLedge = (x: number, y: number, width: number) => {
      const ledgeG = this.make.graphics({ x: 0, y: 0, add: false } as any);
      ledgeG.fillGradientStyle(0x22130a, 0x22130a, 0x0d0402, 0x0d0402, 1);
      ledgeG.fillRect(0, 0, width, 25);
      
      ledgeG.fillStyle(0xd97706, 0.8);
      ledgeG.fillRect(0, 0, width, 4);
      ledgeG.generateTexture(`ledge_${x}_${y}`, width, 25);

      const ledge = this.platforms.create(x, y, `ledge_${x}_${y}`);
      ledge.refreshBody();
    };

    createLedge(450, 480, 220);
    createLedge(850, 360, 260);
    createLedge(1300, 460, 200);
    createLedge(1750, 340, 280);
    createLedge(2150, 480, 220);
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(200, 500, "player_sheet");
    this.player.setScale(this.characterScale);
    this.player.setDepth(30);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(1200);
    this.player.setBodySize(24, 48);
    this.player.setOffset(20, 16);

    // Anims config
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player_sheet", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player_sheet", { start: 4, end: 9 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: "jump",
      frames: [{ key: "player_sheet", frame: 10 }],
      frameRate: 1
    });

    this.anims.create({
      key: "attack",
      frames: this.anims.generateFrameNumbers("player_sheet", { start: 11, end: 13 }),
      frameRate: 20,
      repeat: 0
    });

    this.anims.create({
      key: "hurt",
      frames: [{ key: "player_sheet", frame: 14 }],
      frameRate: 1
    });

    if (!this.anims.exists("enemy_normal_walk")) {
      this.anims.create({
        key: "enemy_normal_walk",
        frames: this.anims.generateFrameNumbers("enemy_normal", { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
      });
    }
    if (!this.anims.exists("enemy_shield_walk")) {
      this.anims.create({
        key: "enemy_shield_walk",
        frames: this.anims.generateFrameNumbers("enemy_shield", { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
    }
    if (!this.anims.exists("enemy_archer_walk")) {
      this.anims.create({
        key: "enemy_archer_walk",
        frames: this.anims.generateFrameNumbers("enemy_archer", { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
    }
    if (!this.anims.exists("boss_walk")) {
      this.anims.create({
        key: "boss_walk",
        frames: this.anims.generateFrameNumbers("boss_lieu_thang", { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
    }

    this.player.play("idle");
  }

  private createFogClouds() {
    // Giảm xuống 8 để tránh lag (ít tweens hơn)
    for (let i = 0; i < 8; i++) {
      const fogX = (i / 8) * this.mapWidth + Math.random() * 200;
      const fogY = 320 + Math.random() * 240;
      const f = this.add.image(fogX, fogY, "fog");
      f.setScale(2.5 + Math.random() * 1.5);
      f.setAlpha(0.10 + Math.random() * 0.08);
      f.setScrollFactor(0.82);
      
      this.tweens.add({
        targets: f,
        x: fogX + (Math.random() > 0.5 ? 200 : -200),
        duration: 10000 + Math.random() * 8000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  }

  private handlePlayerControls(time: number) {
    if (this.playerState === "hurt") return;

    const speed = 250;
    const jumpForce = -600;

    let isMoving = false;

    // Support keyboard and mobile controls
    const leftActive = this.cursors.left.isDown || this.wasd.A.isDown || (this.game.registry.get("mobileMoveLeft") === true);
    const rightActive = this.cursors.right.isDown || this.wasd.D.isDown || (this.game.registry.get("mobileMoveRight") === true);
    const jumpActive = this.cursors.up.isDown || this.wasd.W.isDown || (this.game.registry.get("mobileJump") === true);
    const attackActive = this.spaceKey.isDown || (this.game.registry.get("mobileAttack") === true);

    if (leftActive) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
      isMoving = true;
    } else if (rightActive) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
      isMoving = true;
    } else {
      this.player.setVelocityX(0);
    }

    if (jumpActive && this.player.body.blocked.down) {
      this.player.setVelocityY(jumpForce);
      this.spawnJumpParticles(this.player.x, this.player.y + 24);
    }

    if (attackActive && time - this.lastAttackTime > 280) {
      this.executeAttack(time);
    }

    if (this.game.registry.get("mobileAttack") === true) {
      this.game.registry.set("mobileAttack", false);
    }

    if (this.playerState !== "attacking") {
      if (!this.player.body.blocked.down) {
        this.player.play("jump", true);
      } else if (isMoving) {
        this.player.play("run", true);
      } else {
        this.player.play("idle", true);
      }
    }
  }

  private executeAttack(time: number) {
    this.lastAttackTime = time;
    this.playerState = "attacking";
    this.player.play("attack", true);

    const isFlipped = this.player.flipX;
    const directionSign = isFlipped ? -1 : 1;

    // Show cyan divine glow slash arc
    const slashX = this.player.x + 36 * directionSign;
    const slashY = this.player.y - 4;
    const slash = this.add.sprite(slashX, slashY, "slash_glow");
    slash.setFlipX(isFlipped);
    slash.setDepth(35);
    
    slash.setScale(1);
    this.tweens.add({
      targets: slash,
      scaleX: 1.35,
      scaleY: 1.35,
      alpha: 0,
      duration: 180,
      onComplete: () => slash.destroy()
    });

    this.cameras.main.shake(100, 0.0025);

    // Hitbox calculation
    const attackRange = 120;
    const activeEnemies = this.enemies.getChildren() as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[];

    activeEnemies.forEach((enemy) => {
      const dx = enemy.x - this.player.x;
      const dy = Math.abs(enemy.y - this.player.y);
      const correctSide = isFlipped ? dx < 0 : dx > 0;
      
      if (correctSide && Math.abs(dx) <= attackRange && dy < 60) {
        this.damageEnemy(enemy, directionSign);
      }
    });

    this.time.delayedCall(160, () => {
      if (this.playerState === "attacking") this.playerState = "idle";
    });
  }

  private damageEnemy(enemy: any, knockbackDir: number) {
    // Check if it is the Boss
    if (enemy === this.boss) {
      this.bossHealth = Math.max(0, this.bossHealth - 50);
      this.events.emit("bossHealthChanged", this.bossHealth);

      // Flash red & small knockback (no hitstop - hitstop causes jank)
      enemy.setVelocityX(knockbackDir * 90);
      enemy.setTint(0xef4444);
      this.time.delayedCall(200, () => {
        if (enemy.active) enemy.clearTint();
      });

      this.spawnDamageParticles(enemy.x, enemy.y, 0x06b6d4, 18); // Cyan sparks from Thuận Thiên
      this.spawnDamageParticles(enemy.x, enemy.y, 0xef4444, 12);

      if (this.bossHealth <= 0) {
        // Boss Defeated!
        this.playerScore += 500;
        this.showFloatingCombatText(enemy.x, enemy.y - 30, "+500 CHIẾN TÍCH! TRẢM LIỄU THĂNG", "#fbbf24");
        this.spawnDamageParticles(enemy.x, enemy.y, 0xdc2626, 8);
        this.spawnDamageParticles(enemy.x, enemy.y, 0xfacc15, 6);

        this.events.emit("bossDefeated");
        
        enemy.destroy();
        this.boss = null;

        // Trigger Victory
        this.time.delayedCall(1800, () => {
          this.events.emit("gameVictory");
        });
      } else {
        this.showFloatingCombatText(enemy.x, enemy.y - 35, `Đả Kích! HP: ${this.bossHealth}/500`, "#ef4444");
      }
      return;
    }

    // Normal Enemy logic
    const isShield = enemy.texture.key === "enemy_shield";
    
    // Shield blocks front attacks
    if (isShield && ((knockbackDir > 0 && enemy.flipX) || (knockbackDir < 0 && !enemy.flipX))) {
      this.cameras.main.shake(80, 0.003);
      this.spawnDamageParticles(enemy.x, enemy.y, 0xf59e0b, 10);
      enemy.setVelocityX(knockbackDir * 70);
      this.showFloatingCombatText(enemy.x, enemy.y - 30, "Khiên Đỡ!", "#b45309");
      return;
    }

    enemy.health -= 50;

    // Hitstop lag
    this.physics.world.pause();
    setTimeout(() => {
      this.physics.world.resume();
    }, 45);

    enemy.setVelocityX(knockbackDir * 285);
    enemy.setVelocityY(-140);
    enemy.setTint(0xef4444);
    
    this.time.delayedCall(180, () => {
      if (enemy.active) enemy.clearTint();
    });

    this.spawnDamageParticles(enemy.x, enemy.y, 0x06b6d4, 15); // Divine light sparks
    this.spawnDamageParticles(enemy.x, enemy.y, 0xef4444, 8);

    if (enemy.health <= 0) {
      const maxHealth = enemy.getData("maxHealth") || 50;
      const scoreGain = maxHealth === 100 ? 25 : maxHealth === 50 && enemy.getData("type") === "enemy_archer" ? 15 : 10;
      this.playerScore += scoreGain;
      this.showFloatingCombatText(enemy.x, enemy.y - 30, `+${scoreGain} CHIẾN TÍCH`, "#fbbf24");
      
      this.spawnDamageParticles(enemy.x, enemy.y, 0xdc2626, 20);
      
      this.enemies.remove(enemy);
      enemy.destroy();
    } else {
      this.showFloatingCombatText(enemy.x, enemy.y - 30, "Phá Giáp!", "#ef4444");
    }
  }

  // ==========================================
  // LEVEL DESIGN & MOB SPAWNING
  // ==========================================
  private spawnInitialGuards() {
    // 1. Static guards on platforms
    this.spawnEnemy(450, 420, "enemy_archer");
    this.spawnEnemy(850, 300, "enemy_normal");
    this.spawnEnemy(1300, 400, "enemy_shield");
    this.spawnEnemy(1750, 280, "enemy_archer");

    // 2. Initial ground guards
    this.spawnEnemy(650, 600, "enemy_shield");
    this.spawnEnemy(1100, 600, "enemy_normal");
    this.spawnEnemy(1550, 600, "enemy_archer");
  }

  private spawnEnemyWave() {
    const cameraX = this.cameras.main.scrollX;
    const spawnX = cameraX + 1050 + Math.random() * 250;
    
    if (spawnX < 50 || spawnX > 1750) return; // Don't spawn into boss region

    const types = ["enemy_normal", "enemy_shield", "enemy_archer"];
    const randType = Phaser.Utils.Array.GetRandom(types);
    this.spawnEnemy(spawnX, 550, randType);
  }

  private spawnEnemy(x: number, y: number, key: string) {
    const enemy = this.enemies.create(x, y, key) as any;
    enemy.setScale(this.enemyScale);
    enemy.setDepth(28);
    enemy.setCollideWorldBounds(true);
    enemy.setGravityY(1000);
    enemy.setBodySize(24, 48);
    enemy.setOffset(20, 16);
    
    enemy.setData("type", key);
    enemy.setData("lastShotTime", 0);
    
    if (key === "enemy_shield") {
      enemy.health = 100;
      enemy.setData("maxHealth", 100);
      enemy.setData("speed", 55);
    } else if (key === "enemy_archer") {
      enemy.health = 50;
      enemy.setData("maxHealth", 50);
      enemy.setData("speed", 80);
    } else {
      enemy.health = 50;
      enemy.setData("maxHealth", 50);
      enemy.setData("speed", 105);
    }

    // NOTE: removed repeat:-1 scale tween - it accumulated and caused lag
    enemy.play(key + "_walk");
  }

  private updateEnemyAI(time: number) {
    const activeEnemies = this.enemies.getChildren() as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[];
    
    activeEnemies.forEach((enemy) => {
      if (enemy === this.boss) return; // Handled separately

      const dx = this.player.x - enemy.x;
      const dist = Math.abs(dx);
      const enemyType = enemy.getData("type");
      const speed = enemy.getData("speed");
      
      enemy.setFlipX(dx > 0);

      if (enemyType === "enemy_archer") {
        if (dist > 350) {
          enemy.setVelocityX(dx > 0 ? speed : -speed);
        } else if (dist < 180) {
          enemy.setVelocityX(dx > 0 ? -speed : speed);
        } else {
          enemy.setVelocityX(0);
          const lastShot = enemy.getData("lastShotTime");
          if (time - lastShot > 2000) {
            this.shootArrow(enemy, dx > 0 ? 1 : -1);
            enemy.setData("lastShotTime", time);
          }
        }
      } else {
        if (dist > 70) {
          enemy.setVelocityX(dx > 0 ? speed : -speed);
        } else {
          enemy.setVelocityX(0);
          this.executeEnemyMeleeStrike(enemy, dx > 0 ? 1 : -1, time);
        }
      }
    });
  }

  private shootArrow(archer: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, dir: number) {
    this.tweens.add({
      targets: archer,
      scaleX: this.enemyScale * 1.12,
      duration: 150,
      yoyo: true,
      onComplete: () => {
        if (!archer.active) return;
        const arrow = this.projectiles.create(archer.x + 20 * dir, archer.y - 10, "arrow") as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        arrow.setScale(1.2);
        arrow.setDepth(27);
        arrow.setGravityY(100);
        arrow.setVelocityX(dir * 380);
        arrow.setVelocityY(-80);
        arrow.setFlipX(dir < 0);
        arrow.setBodySize(16, 4);
        
        this.time.delayedCall(4000, () => {
          if (arrow.active) arrow.destroy();
        });
      }
    });
  }

  private executeEnemyMeleeStrike(enemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, dir: number, time: number) {
    const lastAttack = enemy.getData("lastAttackTime") || 0;
    if (time - lastAttack < 1500) return;
    enemy.setData("lastAttackTime", time);

    this.tweens.add({
      targets: enemy,
      x: enemy.x - 12 * dir,
      y: enemy.y - 5,
      duration: 200,
      ease: "Cubic.easeOut",
      onComplete: () => {
        if (!enemy.active) return;
        enemy.setVelocityX(dir * 250);
        
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (dist < 60 && !this.isInvincible && this.playerHealth > 0) {
          this.damagePlayer(20 * dir);
        }
      }
    });
  }

  // ==========================================
  // FINAL BOSS BATTLE LOGIC (LIỄU THĂNG)
  // ==========================================
  private triggerBossFight() {
    this.bossActive = true;
    this.events.emit("bossSpawned");

    // Lock screen scroll bounds & world physics to Boss Arena
    this.cameras.main.setBounds(1800, 0, 800, this.mapHeight);
    this.physics.world.setBounds(1800, 0, 800, this.mapHeight);
    this.player.setCollideWorldBounds(true);

    // Spawn Boss Liễu Thăng
    this.boss = this.enemies.create(2350, 580, "boss_lieu_thang") as any;
    this.boss.setScale(2.0); // Big boss presence
    this.boss.setDepth(29);
    this.boss.setCollideWorldBounds(true);
    this.boss.setGravityY(1000);
    this.boss.setBodySize(32, 48);
    this.boss.setOffset(16, 16);
    this.boss.setData("maxHealth", this.bossMaxHealth);

    this.cameras.main.shake(600, 0.012);
    this.showFloatingCombatText(2100, 300, "TƯỚNG GIẶC LIỄU THĂNG XUẤT HIỆN!", "#ef4444");
    
    this.boss.play("boss_walk");
  }

  private updateBossAI(time: number) {
    if (!this.boss || !this.boss.active) return;

    const dx = this.player.x - this.boss.x;
    const dist = Math.abs(dx);
    const dir = dx > 0 ? 1 : -1;

    this.boss.setFlipX(dx > 0);

    // Move closer if far away
    if (dist > 300) {
      this.boss.setVelocityX(dir * 65);
    } else {
      this.boss.setVelocityX(0);

      // Attack 1: Shoot red fire waves
      const lastShot = this.boss.getData("lastShotTime") || 0;
      if (time - lastShot > 2400) {
        this.shootBossFirewave(this.boss, dir);
        this.boss.setData("lastShotTime", time);
      }

      // Attack 2: Summon aid minion
      const lastSummon = this.boss.getData("lastSummonTime") || 0;
      if (time - lastSummon > 6500) {
        this.summonMinion();
        this.boss.setData("lastSummonTime", time);
      }
    }

    // Heavy Melee swipe if very close
    if (dist < 90 && !this.isInvincible && this.playerHealth > 0) {
      const lastMelee = this.boss.getData("lastMeleeTime") || 0;
      if (time - lastMelee > 1800) {
        this.boss.setData("lastMeleeTime", time);
        
        this.tweens.add({
          targets: this.boss,
          x: this.boss.x - 22 * dir,
          y: this.boss.y - 12,
          duration: 200,
          yoyo: true,
          onComplete: () => {
            if (!this.boss || !this.boss.active) return;
            this.boss.setVelocityX(dir * 190);
            
            const currentDist = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
            if (currentDist < 95 && !this.isInvincible && this.playerHealth > 0) {
              this.damagePlayer(35 * dir);
              this.showFloatingCombatText(this.player.x, this.player.y - 40, "-25 HP! ĐẠI ĐAO TRÚNG", "#ef4444");
            }
          }
        });
      }
    }
  }

  private shootBossFirewave(boss: any, dir: number) {
    this.tweens.add({
      targets: boss,
      scaleX: 2.2, // Visual windup squash
      duration: 160,
      yoyo: true,
      onComplete: () => {
        if (!boss.active) return;
        const wave = this.projectiles.create(boss.x + 40 * dir, boss.y - 12, "firewave") as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        wave.setScale(1.8);
        wave.setDepth(29);
        wave.setVelocityX(dir * 300);
        wave.setFlipX(dir < 0);
        wave.setBodySize(24, 12);
        
        this.time.delayedCall(4000, () => {
          if (wave.active) wave.destroy();
        });
      }
    });
  }

  private summonMinion() {
    if (this.enemies.countActive(true) >= this.maxActiveEnemies + 2) return;
    
    // Spawn helper soldiers within boss arena bounds
    const spawnX = this.boss!.x + (Math.random() > 0.5 ? -180 : -320);
    if (spawnX < 1850 || spawnX > 2550) return;

    this.showFloatingCombatText(this.boss!.x, this.boss!.y - 50, "BỐ BINH CHI viện!", "#ef4444");
    this.spawnDamageParticles(spawnX, 580, 0x991b1b, 10);
    
    const types = ["enemy_normal", "enemy_shield", "enemy_archer"];
    const randType = Phaser.Utils.Array.GetRandom(types);
    this.spawnEnemy(spawnX, 580, randType);
  }

  private handleProjectileHit(player: any, projectile: any) {
    // Lưu data TRƯỚC khi destroy() - body bị xóa sau destroy
    if (!projectile || !projectile.active) return;
    const isFirewave = projectile.texture?.key === "firewave";
    const velX = projectile.body?.velocity?.x ?? projectile.body?.vel?.x ?? 0;
    const dir = velX >= 0 ? 15 : -15;
    
    projectile.destroy();
    
    if (this.isInvincible || this.playerHealth <= 0) return;
    
    const damage = isFirewave ? 25 : 15;
    this.damagePlayerWithAmount(dir, damage, isFirewave ? "ĐAO KHÍ HỎA" : "TÊN GIẶC");
  }

  private handlePlayerEnemyContact(player: any, enemy: any) {
    if (this.isInvincible || this.playerHealth <= 0) return;
    
    const dx = player.x - enemy.x;
    const isBoss = enemy === this.boss;
    const damage = isBoss ? 20 : 15;
    
    this.damagePlayerWithAmount(dx > 0 ? 15 : -15, damage, isBoss ? "LIỄU THĂNG" : "VA CHẠM QUÂN ĐỊCH");
  }

  private damagePlayer(knockbackX: number) {
    this.damagePlayerWithAmount(knockbackX, 15, "TRÚNG CHIÊU");
  }

  private damagePlayerWithAmount(knockbackX: number, amount: number, label: string) {
    this.playerHealth = Math.max(0, this.playerHealth - amount);
    this.isInvincible = true;
    this.playerState = "hurt";
    this.player.play("hurt");
    
    // Shake nhẹ thay vì shake mạnh + flash (flash gây re-render toàn màn hình)
    this.cameras.main.shake(60, 0.004);

    this.player.setVelocityX(knockbackX * 25);
    this.player.setVelocityY(-200);

    this.spawnDamageParticles(this.player.x, this.player.y, 0x801015, 5);
    this.showFloatingCombatText(this.player.x, this.player.y - 30, `-${amount} MÁU!`, "#ef4444");

    if (this.playerHealth <= 0) {
      this.player.setVelocity(0);
      this.player.setTint(0x312e81); // Dark blue death look
      this.physics.pause();
      
      this.time.delayedCall(1000, () => {
        this.events.emit("gameOver");
      });
    } else {
      // Blink animation
      this.tweens.add({
        targets: this.player,
        alpha: 0.3,
        yoyo: true,
        repeat: 5,
        duration: 100,
        onComplete: () => {
          this.player.alpha = 1;
          this.isInvincible = false;
          this.playerState = "idle";
        }
      });
    }
  }

  private updateParallax(time: number) {
    this.bambooTrees.forEach((tree) => {
      const sway = Math.sin(time * 0.001 + tree.x * 0.005) * 4;
      tree.rotation = (sway * Math.PI) / 180 * 0.05;
    });
  }

  // Push to native particle pool (rendered by Canvas2D overlay, NOT Phaser)
  private spawnDamageParticles(x: number, y: number, color: number, count: number) {
    if (_nativeParticles.length > 80) return;
    const cap = Math.min(count, 6);
    for (let i = 0; i < cap; i++) {
      _nativeParticles.push({
        x: x+(Math.random()*24-12), y: y+(Math.random()*16-8),
        vx:(Math.random()-0.5)*180, vy:-(Math.random()*120+40),
        r:2.5+Math.random()*3, color, life:400, maxLife:400
      });
    }
  }

  private spawnJumpParticles(x: number, y: number) {
    if (_nativeParticles.length > 80) return;
    for (let i = 0; i < 4; i++) {
      _nativeParticles.push({
        x:x+(Math.random()*28-14), y,
        vx:(Math.random()-0.5)*90, vy:-(Math.random()*30+10),
        r:3+Math.random()*3, color:0x78350f, life:300, maxLife:300
      });
    }
  }

  // Text pool: pre-created objects reused instead of new Text each hit
  private textPool: Array<{ obj: Phaser.GameObjects.Text; free: boolean }> = [];

  private getPooledText(): Phaser.GameObjects.Text {
    const slot = this.textPool.find(t => t.free);
    if (slot) {
      slot.free = false;
      slot.obj.setVisible(true).setAlpha(1);
      return slot.obj;
    }
    // Create new and add to pool (cap at 10)
    if (this.textPool.length < 10) {
      const t = this.add.text(0, 0, "", {
        fontFamily: "Georgia, serif",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#ffffff"
      });
      t.setOrigin(0.5).setDepth(60);
      this.textPool.push({ obj: t, free: false });
      return t;
    }
    // Pool full - reuse oldest visible one
    const oldest = this.textPool[0];
    this.tweens.killTweensOf(oldest.obj);
    oldest.free = false;
    oldest.obj.setVisible(true).setAlpha(1);
    return oldest.obj;
  }

  private showFloatingCombatText(x: number, y: number, text: string, color: string) {
    const fText = this.getPooledText();
    fText.setPosition(x, y).setText(text).setColor(color).setAlpha(1).setVisible(true);
    fText.setShadow(1, 1, "rgba(0,0,0,0.85)", 3);
    const slot = this.textPool.find(t => t.obj === fText)!;
    this.tweens.add({
      targets: fText,
      y: y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => { slot.free = true; fText.setVisible(false); }
    });
  }
}

// ==========================================
// 3. REACT CONTAINER WRAPPER COMPONENT
// ==========================================
export const HaoKhiGame: React.FC<HaoKhiGameProps> = ({ onClose }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGame = useRef<Phaser.Game | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRafRef = useRef<number>(0);

  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  
  // Game states for stories
  const [gameStarted, setGameStarted] = useState(false);
  const [victory, setVictory] = useState(false);
  const [bossActive, setBossActive] = useState(false);
  const [bossHealth, setBossHealth] = useState(500);

  // Set up Phaser Game
  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      parent: gameRef.current,
      backgroundColor: '#0a1628',
      roundPixels: true,        // snap to pixel grid - faster render
      antialias: false,         // disable AA for perf
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
          fps: 60,
          timeScale: 1
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      render: {
        powerPreference: "high-performance",
        batchSize: 2048,        // larger batch = fewer draw calls
        maxTextures: 8,
        mipmapFilter: "NEAREST",
        desynchronized: true    // reduce input latency on supported browsers
      },
      scene: [HaoKhiScene]
    };

    const game = new Phaser.Game(config);
    phaserGame.current = game;
    game.registry.set("gameStarted", gameStarted);

    // Phaser-React bridge events registration
    const handleEvents = () => {
      const activeScene = game.scene.getScene("HaoKhiScene") as HaoKhiScene;
      if (activeScene) {
        activeScene.events.on("scoreChanged", (newScore: number) => {
          setScore(newScore);
        });
        activeScene.events.on("healthChanged", (newHealth: number) => {
          setHealth(newHealth);
        });
        activeScene.events.on("gameOver", () => {
          setGameOver(true);
        });
        activeScene.events.on("bossSpawned", () => {
          setBossActive(true);
        });
        activeScene.events.on("bossHealthChanged", (newHP: number) => {
          setBossHealth(newHP);
        });
        activeScene.events.on("bossDefeated", () => {
          setBossActive(false);
        });
        activeScene.events.on("gameVictory", () => {
          setVictory(true);
        });
      } else {
        setTimeout(handleEvents, 200);
      }
    };

    setTimeout(handleEvents, 100);

    return () => {
      if (phaserGame.current) {
        phaserGame.current.destroy(true);
        phaserGame.current = null;
      }
      _nativeParticles.length = 0;
    };
  }, []);

  // Native Canvas2D overlay for particles - completely outside Phaser
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let running = true;
    const loop = (dt: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Get Phaser camera offset to align overlay
      let camX = 0;
      if (phaserGame.current) {
        const scene = phaserGame.current.scene.getScene("HaoKhiScene") as any;
        if (scene?.cameras?.main) camX = scene.cameras.main.scrollX;
      }
      // Update + draw particles
      const scale = canvas.width / 1280;
      for (let i = _nativeParticles.length - 1; i >= 0; i--) {
        const p = _nativeParticles[i];
        p.life -= 16;
        if (p.life <= 0) { _nativeParticles.splice(i, 1); continue; }
        p.x += p.vx * 0.016; p.y += p.vy * 0.016; p.vy += 280 * 0.016;
        const alpha = p.life / p.maxLife;
        const sz = Math.max(1, p.r * alpha * 1.4) * scale;
        ctx.fillStyle = _hexToRgb(p.color);
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillRect((p.x - camX) * scale - sz/2, p.y * scale - sz/2, sz, sz);
      }
      ctx.globalAlpha = 1;
      overlayRafRef.current = requestAnimationFrame(loop);
    };
    overlayRafRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(overlayRafRef.current); };
  }, []);

  // Update Registry on start
  const handleStartGame = () => {
    setGameStarted(true);
    if (phaserGame.current) {
      phaserGame.current.registry.set("gameStarted", true);
      const activeScene = phaserGame.current.scene.getScene("HaoKhiScene") as HaoKhiScene;
      if (activeScene) {
        activeScene.scene.resume();
      }
    }
  };

  // Pause / Resume phaser scene depending on React screen overlay visibility
  useEffect(() => {
    if (phaserGame.current) {
      const activeScene = phaserGame.current.scene.getScene("HaoKhiScene") as HaoKhiScene;
      if (activeScene) {
        if (gameStarted && !gameOver && !victory) {
          activeScene.scene.resume();
        } else {
          activeScene.scene.pause();
        }
      }
    }
  }, [gameStarted, gameOver, victory]);

  // Virtual buttons for mobile
  const handleMobileButton = (action: string, active: boolean) => {
    if (phaserGame.current) {
      phaserGame.current.registry.set(action, active);
    }
  };

  const handleRestart = () => {
    setGameOver(false);
    setVictory(false);
    setBossActive(false);
    setBossHealth(500);
    setScore(0);
    setHealth(100);
    if (phaserGame.current) {
      const activeScene = phaserGame.current.scene.getScene("HaoKhiScene") as HaoKhiScene;
      if (activeScene) {
        activeScene.scene.restart();
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black text-white p-2 select-none overflow-hidden justify-between">
      
      {/* 🛡️ CINEMATIC TOPBAR HUD */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-amber-600/20 bg-stone-950/80 z-20 rounded-2xl mx-2 mt-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        {/* Left Side: HP crystal bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-10 h-10 border border-amber-500/20 bg-stone-900 rounded-xl shadow-inner">
            <Heart size={20} className={health > 30 ? "text-red-500 animate-pulse" : "text-red-600 animate-bounce"} />
          </div>
          <div>
            <div className="h-4 w-44 md:w-56 bg-stone-900 rounded-full border border-amber-600/25 overflow-hidden p-0.5 shadow-inner">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-red-800 via-red-600 to-red-500 transition-all duration-150"
                style={{ width: `${health}%` }}
              />
            </div>
            <span className="text-[10px] tracking-widest text-amber-500 font-extrabold block mt-1 uppercase">Lê Lợi Sinh Lực • {health}/100</span>
          </div>
        </div>

        {/* Center: Title / Level Tag */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-[10px] tracking-[0.3em] font-black text-amber-500/50 uppercase">Phát Bản Thử Nghiệm</span>
          <span className="font-serif font-black text-base text-amber-500 tracking-wider">Hào Khí Sơn Hà</span>
        </div>

        {/* Right Side: Score & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-stone-900/60 px-4 py-1.5 rounded-full border border-amber-600/15">
            <Trophy size={14} className="text-amber-400" />
            <span className="text-sm font-extrabold text-amber-400 tracking-wider">{score} <span className="text-[10px] text-stone-500 font-bold uppercase">Chiến Tích</span></span>
          </div>

          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-stone-900 hover:bg-red-800 text-stone-300 hover:text-white text-xs font-bold rounded-full transition-all border border-stone-800 active:scale-95 duration-150"
          >
            <ArrowLeft size={12} /> Đóng Game
          </button>
        </div>
      </div>

      {/* 🖥️ CANVAS CONTAINER */}
      <div className="flex-1 w-full mx-auto flex items-center justify-center p-2 relative min-h-0">
        <div 
          ref={gameRef} 
          className="max-h-full aspect-[16/9] border-2 border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)] bg-slate-950 relative" 
          style={{ width: "min(100%, 1510px, calc((100vh - 170px) * 16 / 9))" }}
        >
          {/* Native Canvas2D overlay for particles - zero Phaser overhead */}
          <canvas
            ref={overlayCanvasRef}
            width={1280}
            height={720}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 10 }}
          />
        </div>

        {/* 📜 HISTORICAL STORY STORYLINE INTRO */}
        {!gameStarted && (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900/98 to-stone-950 z-30 flex flex-col items-center justify-center p-4 text-center overflow-y-auto">
            <div className="max-w-2xl bg-stone-900/95 border-2 border-amber-600/40 rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(120,53,15,0.4)] backdrop-blur-md">
              <Swords className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl md:text-3xl font-serif font-black text-amber-500 mb-5 tracking-wider uppercase border-b border-amber-600/20 pb-3">
                Hào Khí Sơn Hà: Lam Sơn Khởi Nghĩa
              </h2>
              
              <div className="text-stone-300 text-xs md:text-sm space-y-4 mb-8 text-justify leading-relaxed font-medium">
                <p>
                  Vào thế kỷ XV, giặc Minh xâm lược nước ta, đặt ách đô hộ tàn bạo lên nhân dân Đại Việt. Đất nước chìm trong lầm than, khói lửa căm hờn.
                </p>
                <p>
                  Tại vùng núi Lam Sơn (Thanh Hóa), <span className="text-amber-400 font-extrabold">Bình Định Vương Lê Lợi</span> phất cờ tụ nghĩa, chiêu mộ hiền tài. Tương truyền, ngài tìm được lưỡi <span className="text-cyan-400 font-extrabold animate-pulse">Gươm Thần Thuận Thiên</span> phát hào quang xanh dịu kỳ cứu quốc.
                </p>
                <p>
                  Trong vai Anh hùng Áo vải <span className="text-amber-400 font-extrabold">Lê Lợi</span>, hãy cầm Gươm Thần xông pha chiến trận, vượt qua rừng tre Lam Sơn bảo vệ giang sơn, quét sạch quân Minh xâm lược và trảm quyết Đại tướng giặc <span className="text-red-500 font-extrabold">Liễu Thăng</span> ở ải Chi Lăng!
                </p>
              </div>

              <button 
                onClick={handleStartGame}
                className="px-10 py-4 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white font-black rounded-full transition-all active:scale-95 text-sm md:text-base flex items-center gap-3 shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] mx-auto uppercase tracking-widest"
              >
                Phất Cờ Khởi Nghĩa ⚔️
              </button>
            </div>
          </div>
        )}

        {/* 🔴 BOSS HEALTH BAR OVERLAY */}
        {bossActive && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[340px] md:w-[480px] bg-stone-950/95 border border-red-900/50 rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(239,68,68,0.25)] backdrop-blur z-20 flex flex-col gap-1 animate-slide-down">
            <div className="flex justify-between items-center text-[10px] tracking-widest font-black uppercase text-red-500">
              <span className="flex items-center gap-1.5"><Shield size={10} /> ẢI CHI LĂNG</span>
              <span className="animate-pulse">Tướng giặc Liễu Thăng</span>
            </div>
            <div className="h-3 w-full bg-stone-900 rounded-full border border-red-900/30 overflow-hidden p-0.5 shadow-inner">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-red-900 via-red-600 to-orange-500 transition-all duration-200"
                style={{ width: `${(bossHealth / 500) * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-bold text-stone-500 uppercase text-right tracking-widest">{bossHealth}/500 HP</span>
          </div>
        )}

        {/* 🏆 VICTORY POPUP OVERLAY */}
        {victory && (
          <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center overflow-y-auto">
            <div className="max-w-2xl bg-stone-900/95 border-2 border-emerald-600/40 rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(16,185,129,0.3)] backdrop-blur-md">
              <Award className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl md:text-3xl font-serif font-black text-amber-500 mb-5 tracking-wider uppercase border-b border-amber-600/20 pb-3">
                Giang Sơn Thu Về Một Mối!
              </h2>
              
              <div className="text-stone-300 text-xs md:text-sm space-y-4 mb-8 text-justify leading-relaxed font-medium">
                <p>
                  Trận Chi Lăng đại thắng! Với <span className="text-cyan-400 font-extrabold">Gươm Thần Thuận Thiên</span> trong tay, Bình Định Vương Lê Lợi trảm tướng giặc Liễu Thăng tại sườn núi Mã Yên, đánh tan 15 vạn viện binh nhà Minh, buộc giặc Minh rút quân về nước.
                </p>
                <p>
                  Năm 1428, Lê Lợi chính thức lên ngôi Hoàng đế (hiệu là <span className="text-amber-400 font-extrabold">Lê Thái Tổ</span>), đặt tên nước là Đại Việt, ban bố <span className="text-amber-500 font-bold">"Bình Ngô Đại Cáo"</span>, mở ra triều đại Hậu Lê thái bình thịnh trị kéo dài hàng trăm năm.
                </p>
              </div>

              <div className="bg-stone-900/80 border border-amber-600/10 px-8 py-3.5 rounded-2xl mb-8 shadow-inner inline-block">
                <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-widest block mb-1">Thành tích chiến đấu</span>
                <span className="text-2xl font-black font-serif text-amber-400">{score} Chiến Tích</span>
              </div>

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={handleRestart}
                  className="px-8 py-3 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white font-extrabold rounded-full transition-all active:scale-95 text-xs md:text-sm flex items-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                >
                  <RotateCcw size={14} /> Khởi Nghĩa Lại
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white font-bold rounded-full transition-all border border-stone-800 text-xs md:text-sm"
                >
                  Quay lại Bản đồ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🪦 GAMEOVER POPUP SCREEN */}
        {gameOver && (
          <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <span className="text-5xl mb-4">🪦</span>
            <h3 className="text-3xl font-serif font-black text-red-600 mb-2 tracking-wider">Vạn Cổ Lưu Danh</h3>
            <p className="text-stone-400 text-sm max-w-sm mb-6 leading-relaxed">
              Ngài đã hi sinh anh dũng trên chiến địa hiểm họa, bảo vệ bờ cõi bờ giang sơn xã tắc đến giọt máu cuối cùng!
            </p>
            
            <div className="bg-stone-900 border border-amber-600/10 px-8 py-3 rounded-2xl mb-8 shadow-inner">
              <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-widest block">Chiến tích tiêu diệt giặc</span>
              <span className="text-2xl font-black font-serif text-amber-400">{score} Điểm</span>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleRestart}
                className="px-8 py-3 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white font-extrabold rounded-full transition-all active:scale-95 text-sm flex items-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                <RotateCcw size={16} /> Chơi Lại
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white font-bold rounded-full transition-all border border-stone-800 text-sm"
              >
                Quay lại Bản đồ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🎮 MOBILE VIRTUAL JOYSTICK & CONTROLS */}
      <div className="block md:hidden w-full max-w-4xl mx-auto px-4 py-2 border-t border-stone-900 bg-stone-950/60 rounded-3xl mb-1 shadow-2xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-4">
            <button
              onTouchStart={() => handleMobileButton("mobileMoveLeft", true)}
              onTouchEnd={() => handleMobileButton("mobileMoveLeft", false)}
              onMouseDown={() => handleMobileButton("mobileMoveLeft", true)}
              onMouseUp={() => handleMobileButton("mobileMoveLeft", false)}
              className="w-16 h-16 bg-stone-900/90 active:bg-amber-600/20 text-stone-400 active:text-amber-400 border border-stone-800 active:border-amber-500/50 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-all"
            >
              ◀
            </button>
            <button
              onTouchStart={() => handleMobileButton("mobileMoveRight", true)}
              onTouchEnd={() => handleMobileButton("mobileMoveRight", false)}
              onMouseDown={() => handleMobileButton("mobileMoveRight", true)}
              onMouseUp={() => handleMobileButton("mobileMoveRight", false)}
              className="w-16 h-16 bg-stone-900/90 active:bg-amber-600/20 text-stone-400 active:text-amber-400 border border-stone-800 active:border-amber-500/50 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-all"
            >
              ▶
            </button>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onTouchStart={() => handleMobileButton("mobileJump", true)}
              onTouchEnd={() => handleMobileButton("mobileJump", false)}
              onMouseDown={() => handleMobileButton("mobileJump", true)}
              onMouseUp={() => handleMobileButton("mobileJump", false)}
              className="w-16 h-16 bg-stone-900/90 active:bg-amber-600/20 text-stone-400 active:text-amber-400 border border-stone-800 active:border-amber-500/50 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all"
            >
              NHẢY
            </button>
            <button
              onTouchStart={() => handleMobileButton("mobileAttack", true)}
              onTouchEnd={() => handleMobileButton("mobileAttack", false)}
              onMouseDown={() => handleMobileButton("mobileAttack", true)}
              onMouseUp={() => handleMobileButton("mobileAttack", false)}
              className="w-20 h-20 bg-gradient-to-tr from-red-800 to-amber-600 active:from-red-950 active:to-amber-800 text-white border-2 border-amber-400/40 rounded-full flex flex-col items-center justify-center shadow-2xl active:scale-90 transition-all cursor-pointer"
            >
              <span className="text-xl">⚔️</span>
              <span className="text-[9px] font-black uppercase tracking-widest mt-1 text-amber-200">ĐÁNH</span>
            </button>
          </div>
        </div>
      </div>

      {/* ⌨️ DESKTOP LEGEND INFO */}
      <div className="hidden md:flex justify-center items-center gap-6 text-[10px] text-stone-500 font-extrabold uppercase bg-stone-950/40 border border-stone-900 py-2.5 rounded-2xl mx-2 mb-2 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-stone-900 text-stone-300 border border-stone-800 rounded shadow">A</span> / 
          <span className="px-2 py-0.5 bg-stone-900 text-stone-300 border border-stone-800 rounded shadow">D</span> hoặc 
          <span className="px-1.5 py-0.5 bg-stone-900 text-stone-300 border border-stone-800 rounded shadow">←</span>
          <span className="px-1.5 py-0.5 bg-stone-900 text-stone-300 border border-stone-800 rounded shadow">→</span>
          <span>Di chuyển</span>
        </div>
        <div className="w-1.5 h-1.5 bg-stone-800 rounded-full" />
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-stone-900 text-stone-300 border border-stone-800 rounded shadow">W</span> hoặc 
          <span className="px-1.5 py-0.5 bg-stone-900 text-stone-300 border border-stone-800 rounded shadow">↑</span>
          <span>Nhảy lên</span>
        </div>
        <div className="w-1.5 h-1.5 bg-stone-800 rounded-full" />
        <div className="flex items-center gap-2">
          <span className="px-6 py-0.5 bg-stone-900 text-stone-300 border border-stone-800 rounded shadow">DẤU CÁCH (SPACE)</span>
          <span>Công Kích Gươm Thần ⚔</span>
        </div>
      </div>

    </div>
  );
};
