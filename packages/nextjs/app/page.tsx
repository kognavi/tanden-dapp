"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// ===== 段位定義 =====
const RANKS = [
  { min: 0, label: "🌱 無段", color: "#93c5fd", glow: "rgba(147,197,253,0.4)" },
  { min: 3, label: "🌀 初段", color: "#38bdf8", glow: "rgba(56,189,248,0.5)" },
  { min: 5, label: "⚔️ 三段", color: "#60a5fa", glow: "rgba(96,165,250,0.6)" },
  { min: 7, label: "🥋 五段", color: "#818cf8", glow: "rgba(129,140,248,0.6)" },
  { min: 10, label: "🏆 丹田マスター", color: "#e0f2fe", glow: "rgba(224,242,254,0.9)" },
];

const getRank = (power: number) => [...RANKS].reverse().find(r => power >= r.min) ?? RANKS[0];

// ===== 段位ステップ =====
const RankSteps = ({ power }: { power: number }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      marginBottom: "8px",
      padding: "0 4px",
    }}
  >
    {RANKS.map((r, i) => {
      const reached = power >= r.min;
      return (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              border: "2px solid",
              backgroundColor: reached ? r.color : "transparent",
              borderColor: reached ? r.color : "#334155",
              boxShadow: reached ? `0 0 10px ${r.glow}` : "none",
              transition: "all 0.5s",
            }}
          />
          <span style={{ color: reached ? r.color : "#334155", fontSize: "9px", fontWeight: "bold" }}>{r.min}</span>
        </div>
      );
    })}
  </div>
);

// ===== メインコンポーネント =====
const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [nftMetadata, setNftMetadata] = useState<any>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [trainCount, setTrainCount] = useState(0);
  const [powerDelta, setPowerDelta] = useState<number | null>(null);
  const [prevPower, setPrevPower] = useState<number | null>(null);

  // ── コントラクト読み取り ──
  const { data: tandenPower } = useScaffoldReadContract({
    contractName: "TandenToken",
    functionName: "tandenPowerLevel",
    args: [connectedAddress],
  });
  const { data: nftBalance } = useScaffoldReadContract({
    contractName: "TandenNFT",
    functionName: "balanceOf",
    args: [connectedAddress],
  });
  const { data: tokenURI } = useScaffoldReadContract({
    contractName: "TandenNFT",
    functionName: "tokenURI",
    args: [1n],
  });

  // ── コントラクト書き込み ──
  const { writeContractAsync: increasePower, isPending: isIncreasing } = useScaffoldWriteContract("TandenToken");
  const { writeContractAsync: claimMasterNFT, isPending: isClaiming } = useScaffoldWriteContract("TandenNFT");

  // ── 派生値 ──
  const powerNum = tandenPower !== undefined ? Number(tandenPower) : 0;
  const isMaster = tandenPower !== undefined && tandenPower >= 10n;
  const hasNFT = nftBalance !== undefined && nftBalance > 0n;
  const rank = getRank(powerNum);
  const gaugePercent = Math.min((powerNum / 10) * 100, 100);
  const remaining = Math.max(10 - powerNum, 0);

  // ── パワー変化検知 ──
  useEffect(() => {
    if (prevPower !== null && powerNum !== prevPower) {
      setPowerDelta(powerNum - prevPower);
      setTimeout(() => setPowerDelta(null), 1500);
    }
    setPrevPower(powerNum);
  }, [powerNum]);

  // ── IPFS → HTTP 変換 ──
  const resolveIpfsUrl = (url: string) => url?.replace("ipfs://", "https://ipfs.io/ipfs/") ?? "";

  // ── NFTメタデータ取得 ──
  useEffect(() => {
    const fetchMetadata = async () => {
      if (tokenURI && typeof tokenURI === "string" && tokenURI.startsWith("ipfs://")) {
        try {
          const res = await fetch(resolveIpfsUrl(tokenURI));
          const data = await res.json();
          setNftMetadata(data);
        } catch (e) {
          console.error("メタデータ取得失敗:", e);
        }
      }
    };
    if (hasNFT) fetchMetadata();
  }, [tokenURI, hasNFT]);

  // ── 鍛錬ハンドラ ──
  const handleIncrease = async () => {
    if (isIncreasing || isMaster) return;
    setShowFlash(true);
    setTrainCount(c => c + 1);
    setTimeout(() => setShowFlash(false), 500);
    try {
      await increasePower({ functionName: "increaseTandenPower" });
    } catch (e) {
      console.error("トランザクション失敗:", e);
    }
  };

  // ── NFT受け取りハンドラ ──
  const handleClaimNFT = async () => {
    try {
      await claimMasterNFT({ functionName: "claimMasterNFT" });
    } catch (e) {
      console.error("NFT受け取りエラー:", e);
    }
  };

  // ── ウォレット未接続画面 ──
  if (!connectedAddress) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0a1628 0%, #0d2347 40%, #0a1f3d 70%, #071020 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>🧘</div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 900,
            marginBottom: "16px",
            letterSpacing: "4px",
            background: "linear-gradient(135deg, #bfdbfe, #60a5fa, #38bdf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          丹田パワー測定器
        </h1>
        <p style={{ marginBottom: "32px", fontSize: "14px", color: "#1e40af" }}>ウォレットを接続して鍛錬を開始しよう</p>
        <div
          style={{
            padding: "12px 24px",
            borderRadius: "999px",
            fontSize: "14px",
            border: "1px solid #38bdf8",
            color: "#38bdf8",
          }}
        >
          右上の「Connect Wallet」をクリック ↗
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "40px",
        paddingBottom: "80px",
        background: "linear-gradient(160deg, #0a1628 0%, #0d2347 40%, #0a1f3d 70%, #071020 100%)",
        filter: showFlash ? "brightness(1.3)" : "brightness(1)",
        transition: "filter 0.3s",
      }}
    >
      {/* フラッシュオーバーレイ */}
      {showFlash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 50,
            background: "radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)",
          }}
        />
      )}

      <div style={{ padding: "0 20px", width: "100%", maxWidth: "480px" }}>
        {/* ── ヘッダー ── */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, transparent, #38bdf8)" }} />
            <span style={{ color: "#38bdf8", fontSize: "11px", letterSpacing: "4px", fontWeight: "bold" }}>
              TANDEN POWER SYSTEM
            </span>
            <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, #38bdf8, transparent)" }} />
          </div>
          <h1
            style={{
              fontSize: "42px",
              fontWeight: 900,
              letterSpacing: "2px",
              margin: 0,
              background: "linear-gradient(135deg, #bfdbfe, #60a5fa, #38bdf8, #e0f2fe)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(56,189,248,0.5))",
            }}
          >
            🧘 丹田パワー測定器
          </h1>
          <p style={{ marginTop: "8px", fontSize: "11px", letterSpacing: "4px", color: "#1e40af" }}>Sepolia Testnet</p>
        </div>

        {/* ── メインカード ── */}
        <div
          style={{
            padding: "32px",
            borderRadius: "24px",
            marginBottom: "24px",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(145deg, #0f2044, #0a1a38, #0d2550)",
            border: `1px solid ${rank.color}44`,
            boxShadow: `0 0 50px ${rank.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {/* 上部メタリックライン */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${rank.color}, transparent)`,
            }}
          />
          {/* 背景グロー */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: `radial-gradient(ellipse at 50% 0%, ${rank.color}15, transparent 70%)`,
            }}
          />

          {/* 段位バッジ */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <span
              style={{
                padding: "6px 24px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: "bold",
                color: rank.color,
                border: `1px solid ${rank.color}66`,
                background: `linear-gradient(135deg, ${rank.color}15, ${rank.color}08)`,
                boxShadow: `0 0 12px ${rank.glow}`,
                letterSpacing: "2px",
              }}
            >
              {rank.label}
            </span>
          </div>

          {/* パワー数値 + デルタ */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "108px",
                fontWeight: 900,
                lineHeight: 1,
                background: `linear-gradient(180deg, #ffffff, ${rank.color})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: `drop-shadow(0 0 20px ${rank.glow})`,
                transition: "all 0.5s",
              }}
            >
              {powerNum}
            </span>
            {powerDelta !== null && (
              <span
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "28%",
                  color: "#38bdf8",
                  fontSize: "30px",
                  fontWeight: 900,
                  textShadow: "0 0 10px rgba(56,189,248,0.8)",
                }}
              >
                +{powerDelta}
              </span>
            )}
          </div>
          <p style={{ textAlign: "center", fontSize: "14px", color: "#334155", marginBottom: "24px" }}>
            / 10 でマスター解放
          </p>

          {/* 段位ステップ */}
          <RankSteps power={powerNum} />

          {/* ゲージバー */}
          <div
            style={{
              width: "100%",
              borderRadius: "999px",
              height: "20px",
              overflow: "hidden",
              background: "rgba(15,32,68,0.8)",
              border: "1px solid #1e3a5f",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                height: "20px",
                borderRadius: "999px",
                width: `${gaugePercent}%`,
                background: "linear-gradient(90deg, #1d4ed8, #2563eb, #38bdf8, #e0f2fe)",
                boxShadow: "0 0 15px rgba(56,189,248,0.7)",
                transition: "width 1s ease-out",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "999px",
                  opacity: 0.4,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.4), transparent)",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "#1e3a5f",
              marginBottom: "24px",
            }}
          >
            <span>0</span>
            <span style={{ color: "#38bdf8" }}>{gaugePercent.toFixed(0)}%</span>
            <span>10</span>
          </div>

          {/* 鍛錬ボタン */}
          <button
            onClick={handleIncrease}
            disabled={isIncreasing || isMaster}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "16px",
              fontSize: "18px",
              fontWeight: 900,
              color: "white",
              background:
                isIncreasing || isMaster
                  ? "linear-gradient(135deg, #1e293b, #0f172a)"
                  : "linear-gradient(135deg, #1d4ed8, #2563eb, #0ea5e9)",
              boxShadow:
                isIncreasing || isMaster ? "none" : "0 0 30px rgba(37,99,235,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
              border: "1px solid rgba(56,189,248,0.3)",
              opacity: isMaster ? 0.6 : 1,
              cursor: isMaster ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {isIncreasing
              ? "⏳ 鍛錬中..."
              : isMaster
                ? "✅ マスターに到達済み"
                : `🔥 丹田を鍛える（残り ${remaining} 回）`}
          </button>

          {trainCount > 0 && (
            <p style={{ textAlign: "center", fontSize: "12px", color: "#1e3a5f", marginTop: "12px" }}>
              このセッションの鍛錬：<span style={{ color: "#38bdf8" }}>{trainCount} 回</span>
            </p>
          )}
        </div>

        {/* ── NFT / マスターエリア ── */}
        {hasNFT ? (
          <div
            style={{
              padding: "32px",
              borderRadius: "24px",
              textAlign: "center",
              color: "white",
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(135deg, #0a1628, #0d2347, #0a1f3d)",
              border: "2px solid #38bdf8",
              boxShadow: "0 0 50px rgba(56,189,248,0.5)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "1px",
                background: "linear-gradient(90deg, transparent, #38bdf8, transparent)",
              }}
            />
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 900,
                marginBottom: "8px",
                background: "linear-gradient(135deg, #bfdbfe, #38bdf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🎉 丹田マスター認定 🎉
            </h2>
            <p style={{ marginBottom: "24px", fontSize: "14px", color: "#38bdf888" }}>あなたは真の丹田マスターです！</p>
            {nftMetadata ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img
                  src={resolveIpfsUrl(nftMetadata.image)}
                  alt={nftMetadata.name}
                  style={{
                    width: "192px",
                    height: "192px",
                    objectFit: "cover",
                    borderRadius: "16px",
                    marginBottom: "16px",
                    border: "2px solid #38bdf8",
                    boxShadow: "0 0 30px rgba(56,189,248,0.4)",
                  }}
                />
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, #e0f2fe, #38bdf8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {nftMetadata.name}
                </h3>
                <p style={{ fontSize: "13px", marginTop: "8px", fontStyle: "italic", color: "#38bdf866" }}>
                  {nftMetadata.description}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: "192px",
                    height: "192px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "80px",
                    background: "linear-gradient(135deg, #0d2347, #1e3a5f)",
                    border: "2px solid #38bdf8",
                    boxShadow: "0 0 30px rgba(56,189,248,0.4)",
                  }}
                >
                  🏆
                </div>
                <p style={{ marginTop: "16px", fontSize: "13px", color: "#38bdf866" }}>ブロックチェーンから召喚中...</p>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: "32px",
              borderRadius: "24px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              background: isMaster ? "linear-gradient(135deg, #0d2347, #0a1f3d)" : "rgba(10,22,40,0.6)",
              border: isMaster ? "1px solid #38bdf8" : "1px solid #1e3a5f",
              boxShadow: isMaster ? "0 0 30px rgba(56,189,248,0.3)" : "none",
            }}
          >
            {isMaster && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, #38bdf8, transparent)",
                }}
              />
            )}
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: isMaster ? "#e0f2fe" : "#1e3a5f",
              }}
            >
              🏆 マスターへの道
            </h2>
            <p style={{ marginBottom: "24px", fontSize: "14px", color: isMaster ? "#38bdf8" : "#1e3a5f" }}>
              {isMaster ? "おめでとう！NFTを受け取ろう！" : `あと ${remaining} 回の鍛錬でマスター解放！`}
            </p>
            <button
              onClick={handleClaimNFT}
              disabled={!isMaster || isClaiming}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                fontSize: "18px",
                fontWeight: 900,
                background: isMaster ? "linear-gradient(135deg, #1d4ed8, #0ea5e9)" : "rgba(255,255,255,0.03)",
                color: isMaster ? "#fff" : "#1e3a5f",
                border: isMaster ? "1px solid rgba(56,189,248,0.5)" : "1px solid #1e3a5f",
                boxShadow: isMaster ? "0 0 24px rgba(56,189,248,0.5)" : "none",
                cursor: isMaster && !isClaiming ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              {isClaiming ? "⏳ 受け取り中..." : isMaster ? "🏅 マスターNFTを受け取る！" : "🔒 まだ受け取れません"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
