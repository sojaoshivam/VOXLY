import { C, typography } from "./theme";
import { Reveal } from "./UI";

export function BeforeAfter() {
    return (
        <section id="how-it-works" style={{ padding: "140px 40px", maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
                <div style={{ textAlign: "center", marginBottom: 96 }}>
                    {/* Eyebrow label */}
                    <span style={{
                        display: "inline-block",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#ec4899",
                        marginBottom: 20,
                        padding: "5px 14px",
                        border: "1px solid rgba(236,72,153,0.3)",
                        borderRadius: 100,
                        background: "rgba(236,72,153,0.1)",
                    }}>
                        The difference
                    </span>

                    <h2 style={{
                        fontFamily: typography.serif,
                        fontSize: "clamp(40px, 5vw, 58px)",
                        letterSpacing: "-0.025em",
                        fontWeight: 400,
                        lineHeight: 1.15,
                        margin: 0,
                        color: C.black,
                    }}>
                        The old way is{" "}
                        <em style={{
                            color: "#d1d5db",
                            fontStyle: "italic",
                            position: "relative",
                            display: "inline-block",
                        }}>
                            exhausting.
                            {/* Strikethrough decoration */}
                            <span style={{
                                position: "absolute",
                                left: 0, right: 0,
                                top: "52%",
                                height: 2,
                                background: "#e5e7eb",
                                borderRadius: 2,
                                transform: "translateY(-50%)",
                            }} />
                        </em>
                    </h2>

                    <p style={{
                        marginTop: 20,
                        fontSize: 17,
                        color: "rgba(255,255,255,0.5)",
                        fontFamily: typography.serif,
                        fontStyle: "italic",
                        letterSpacing: "-0.01em",
                    }}>
                        Same result. 720× faster.
                    </p>
                </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {
                        label: "Before",
                        accent: "rgba(255,255,255,0.02)",
                        border: "rgba(255,255,255,0.08)",
                        textColor: "rgba(255,255,255,0.4)",
                        stepNumBg: "rgba(255,255,255,0.05)",
                        stepNumColor: "rgba(255,255,255,0.3)",
                        steps: [
                            { text: "Set up the mic", emoji: "🎤" },
                            { text: "Record take 1… too quiet", emoji: null },
                            { text: "Take 7… dog barked", emoji: null },
                            { text: "Take 14… perfect!", emoji: null },
                            { text: "Edit out the breaths", emoji: "😮‍💨" },
                            { text: "Export. Finally.", emoji: null },
                        ],
                        tag: "~2 hours",
                        tagColor: "#ef4444",
                        tagBg: "rgba(239, 68, 68, 0.1)",
                        italic: false,
                    },
                    {
                        label: "With VOXLY",
                        accent: "rgba(236,72,153,0.04)",
                        border: "rgba(236,72,153,0.2)",
                        textColor: "rgba(255,255,255,0.9)",
                        stepNumBg: undefined, // gradient
                        stepNumColor: "white",
                        steps: [
                            { text: "Open VOXLY", emoji: null },
                            { text: "Paste your script", emoji: null },
                            { text: "Pick language & tone", emoji: null },
                            { text: "Click Generate", emoji: null },
                            { text: "Download MP3", emoji: null },
                            { text: "You're done.", emoji: "✓" },
                        ],
                        tag: "~10 seconds",
                        tagColor: "#10b981",
                        tagBg: "rgba(16, 185, 129, 0.1)",
                        italic: true,
                    },
                ].map((side, i) => (
                    <Reveal key={i} delay={i * 0.12}>
                        <div style={{
                            background: side.accent,
                            border: `1.5px solid ${side.border}`,
                            borderRadius: 20,
                            padding: "52px 48px 48px",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            position: "relative",
                            overflow: "hidden",
                            /* Soft shadow for depth */
                            boxShadow: i === 1
                                ? "0 4px 32px 0 #f472b618, 0 1px 4px 0 #ec489912"
                                : "0 2px 12px 0 #0000000a",
                            transition: "box-shadow 0.25s ease",
                        }}>

                            {/* Background ornament for "after" card */}
                            {i === 1 && (
                                <div style={{
                                    position: "absolute",
                                    top: -60, right: -60,
                                    width: 220, height: 220,
                                    borderRadius: "50%",
                                    background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }} />
                            )}

                            {/* Header row */}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 40,
                            }}>
                                <div>
                                    <span style={{
                                        fontFamily: typography.serif,
                                        fontSize: 30,
                                        fontWeight: 400,
                                        color: i === 1 ? "white" : "rgba(255,255,255,0.4)",
                                        fontStyle: side.italic ? "italic" : "normal",
                                        letterSpacing: "-0.02em",
                                        lineHeight: 1,
                                        display: "block",
                                    }}>
                                        {side.label}
                                    </span>
                                    {/* Underline accent on "after" */}
                                    {i === 1 && (
                                        <span style={{
                                            display: "block",
                                            width: 40,
                                            height: 2.5,
                                            marginTop: 10,
                                            borderRadius: 2,
                                            background: "linear-gradient(90deg, #ec4899, #f97316)",
                                        }} />
                                    )}
                                </div>

                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    padding: "6px 12px",
                                    borderRadius: 100,
                                    background: side.tagBg,
                                    color: side.tagColor,
                                    border: `1px solid ${side.tagColor}20`,
                                    whiteSpace: "nowrap",
                                }}>
                                    {side.tag}
                                </span>
                            </div>

                            {/* Divider */}
                            <div style={{
                                height: 1,
                                background: i === 1 ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.05)",
                                marginBottom: 32,
                            }} />

                            {/* Steps */}
                            <ol style={{
                                listStyle: "none",
                                margin: 0,
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: 18,
                                flex: 1,
                            }}>
                                {side.steps.map((step, j) => (
                                    <li key={j} style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 16,
                                        opacity: i === 0 ? 1 - j * 0.09 : 1,
                                    }}>
                                        <span style={{
                                            width: 26, height: 26,
                                            borderRadius: "50%",
                                            background: i === 1
                                                ? "linear-gradient(135deg, #ec4899, #f97316)"
                                                : side.stepNumBg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 11,
                                            color: i === 1 ? "white" : side.stepNumColor,
                                            fontWeight: 700,
                                            flexShrink: 0,
                                            boxShadow: i === 1 ? "0 2px 8px #ec489940" : "none",
                                        }}>
                                            {j + 1}
                                        </span>
                                        <span style={{
                                            fontSize: 15,
                                            color: side.textColor,
                                            lineHeight: 1.5,
                                            fontWeight: i === 1 && j === 5 ? 600 : 400,
                                        }}>
                                            {step.text}
                                            {step.emoji && (
                                                <span style={{ marginLeft: 6 }}>{step.emoji}</span>
                                            )}
                                        </span>

                                        {/* Checkmark for "after" completed step */}
                                        {i === 1 && j === 5 && (
                                            <span style={{
                                                marginLeft: "auto",
                                                width: 22, height: 22,
                                                borderRadius: "50%",
                                                background: "rgba(16,185,129,0.15)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 12,
                                                color: "#10b981",
                                                flexShrink: 0,
                                            }}>
                                                ✓
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ol>

                            {/* Bottom CTA for "after" card */}
                            {i === 1 && (
                                <div style={{ marginTop: 40 }}>
                                    <div style={{
                                        height: 1,
                                        background: "rgba(236,72,153,0.15)",
                                        marginBottom: 28,
                                    }} />
                                    <button style={{
                                        width: "100%",
                                        padding: "14px 24px",
                                        borderRadius: 12,
                                        border: "none",
                                        background: "linear-gradient(135deg, #ec4899, #f97316)",
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: 15,
                                        letterSpacing: "-0.01em",
                                        cursor: "pointer",
                                        boxShadow: "0 4px 16px #ec489930",
                                    }}>
                                        Try it free →
                                    </button>
                                </div>
                            )}

                            {/* Muted "waste less time" footer for before card */}
                            {i === 0 && (
                                <p style={{
                                    marginTop: 32,
                                    fontSize: 12,
                                    color: "#d1d5db",
                                    textAlign: "center",
                                    fontStyle: "italic",
                                    fontFamily: typography.serif,
                                }}>
                                    Every. Single. Time.
                                </p>
                            )}
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}